from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional

from database import get_db
from models import Attack, User, Sensor
from schemas import AttackOut, AttackList, PublicAttackOut
from dependencies import require_admin
from security import get_current_user

router = APIRouter(prefix="/api/attacks", tags=["attacks"])


@router.get("/public", response_model=list[PublicAttackOut])
async def list_attacks_public(
    limit: int = Query(25, ge=1, le=50),
    db:    AsyncSession = Depends(get_db),
):
    """Recent attacks for public showcase — no auth, no sensitive fields."""
    items = (await db.execute(
        select(Attack).order_by(desc(Attack.timestamp)).limit(limit)
    )).scalars().all()
    return items


@router.get("", response_model=AttackList)
async def list_attacks(
    page:      int = Query(1, ge=1),
    limit:     int = Query(50, ge=1, le=200),
    honeypot:  Optional[str] = None,
    country:   Optional[str] = None,
    sensor_id: Optional[int] = None,
    db:        AsyncSession = Depends(get_db),
    _:         User = Depends(require_admin),
):
    offset = (page - 1) * limit
    q  = select(Attack).order_by(desc(Attack.timestamp))
    cq = select(func.count(Attack.id))

    if honeypot:
        q  = q.where(Attack.honeypot == honeypot)
        cq = cq.where(Attack.honeypot == honeypot)
    if country:
        q  = q.where(Attack.country_code == country)
        cq = cq.where(Attack.country_code == country)
    if sensor_id is not None:
        q  = q.where(Attack.sensor_id == sensor_id)
        cq = cq.where(Attack.sensor_id == sensor_id)

    total = (await db.execute(cq)).scalar_one()
    items = (await db.execute(q.offset(offset).limit(limit))).scalars().all()
    return AttackList(total=total, page=page, limit=limit, items=items)


@router.get("/mine", response_model=AttackList)
async def list_my_attacks(
    page:      int          = Query(1,  ge=1),
    limit:     int          = Query(50, ge=1, le=200),
    tenant_id: Optional[int] = None,
    db:        AsyncSession = Depends(get_db),
    current_user: User      = Depends(get_current_user),
):
    if current_user.role in ("admin", "employee") and tenant_id is not None:
        effective_id = tenant_id
    else:
        effective_id = current_user.id

    sensor_ids = list((await db.execute(
        select(Sensor.id).where(Sensor.tenant_id == effective_id)
    )).scalars().all())

    if not sensor_ids:
        return AttackList(total=0, page=page, limit=limit, items=[])

    base   = Attack.sensor_id.in_(sensor_ids)
    offset = (page - 1) * limit
    total  = (await db.execute(select(func.count(Attack.id)).where(base))).scalar_one()
    items  = (await db.execute(
        select(Attack).where(base).order_by(desc(Attack.timestamp)).offset(offset).limit(limit)
    )).scalars().all()
    return AttackList(total=total, page=page, limit=limit, items=items)


@router.get("/{attack_id}", response_model=AttackOut)
async def get_attack(
    attack_id: int,
    db: AsyncSession = Depends(get_db),
    _:  User = Depends(require_admin),
):
    result = await db.execute(select(Attack).where(Attack.id == attack_id))
    return result.scalar_one()
