from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from database import get_db
from models import User
from schemas import TokenResponse, UserOut, FreemiumRegisterIn, ClientRegisterIn, AdminCreateClientIn, AdminCreateEmployeeIn
from security import verify_password, hash_password, create_access_token, get_current_user, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/auth", tags=["auth"])

PAID_PLANS = {"basico", "profesional", "empresarial"}


def _auto_generate_install_token(user_id: int, plan: str) -> str:
    payload = {
        "type": "sensor_install",
        "sub":  str(user_id),
        "plan": plan,
        "exp":  datetime.now(timezone.utc) + timedelta(hours=72),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", response_model=TokenResponse)
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db:   AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.username == form.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta desactivada")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", role=user.role)


@router.post("/register/free", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_free(
    data: FreemiumRegisterIn,
    db:   AsyncSession = Depends(get_db),
):
    dup = await db.execute(select(User).where(User.username == data.username))
    if dup.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de usuario ya está en uso",
        )
    user = User(
        username        = data.username,
        hashed_password = hash_password(data.password),
        role            = "client",
        is_active       = True,
        plan            = "freemium",
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El nombre de usuario ya está en uso")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", role=user.role)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: ClientRegisterIn,
    db:   AsyncSession = Depends(get_db),
):
    # Verificar unicidad de username y email
    dup = await db.execute(
        select(User).where((User.username == data.username) | (User.email == data.email))
    )
    if dup.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de usuario o email ya está en uso",
        )

    user = User(
        username        = data.username,
        email           = data.email,
        hashed_password = hash_password(data.password),
        role            = "client",
        is_active       = True,
        company_name    = data.company_name,
        company_sector  = data.company_sector,
        plan            = data.plan,
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de usuario o email ya está en uso",
        )

    # Auto-generate sensor install token (72 h) for paid plans
    if data.plan in PAID_PLANS:
        install_token = _auto_generate_install_token(user.id, data.plan)
        user.sensor_install_token    = install_token
        user.sensor_token_created_at = datetime.now(timezone.utc)
        await db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", role=user.role)


@router.post("/admin/create-client", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def admin_create_client(
    data: AdminCreateClientIn,
    db:   AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo admins")

    dup = await db.execute(
        select(User).where((User.username == data.username) | (User.email == data.email))
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Usuario o email ya existe")

    user = User(
        username        = data.username,
        email           = data.email,
        hashed_password = hash_password(data.password),
        role            = "client",
        is_active       = True,
        company_name    = data.company_name,
        company_sector  = data.company_sector or "Tecnología y Software",
        plan            = data.plan,
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Usuario o email ya existe")
    return user


@router.post("/logout")
async def logout():
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/admin/create-employee", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def admin_create_employee(
    data: AdminCreateEmployeeIn,
    db:   AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo admins")

    dup = await db.execute(
        select(User).where((User.username == data.username) | (User.email == data.email))
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Usuario o email ya existe")

    user = User(
        username        = data.username,
        email           = data.email,
        hashed_password = hash_password(data.password),
        role            = "employee",
        is_active       = True,
    )
    db.add(user)
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Usuario o email ya existe")
    return user


@router.get("/admin/employees", response_model=list[UserOut])
async def admin_list_employees(
    db:           AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo admins")

    result = await db.execute(
        select(User).where(User.role == "employee").order_by(User.created_at.desc())
    )
    return result.scalars().all()


@router.get("/admin/clients", response_model=list[UserOut])
async def admin_list_clients(
    db:           AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo admins")

    result = await db.execute(
        select(User).where(User.role == "client").order_by(User.created_at.desc())
    )
    return result.scalars().all()


@router.get("/admin/clients/{client_id}", response_model=UserOut)
async def admin_get_client(
    client_id:    int,
    db:           AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo admins")

    result = await db.execute(
        select(User).where(User.id == client_id, User.role == "client")
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return client
