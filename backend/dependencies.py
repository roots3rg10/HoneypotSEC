from fastapi import Depends, HTTPException, status
from models import User
from security import get_current_user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requiere rol admin")
    return current_user


async def require_employee(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("admin", "employee"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    return current_user
