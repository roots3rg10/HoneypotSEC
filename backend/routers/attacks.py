from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, text
from typing import Optional
from database import get_db
from models import Attack
from schemas import AttackOut, AttackList

router = APIRouter(prefix="/api/attacks", tags=["attacks"])

@router.get("", response_model=AttackList)
async def list_attacks(
    page:     int = Query(1, ge=1),
    limit:    int = Query(50, ge=1, le=200),
    honeypot: Optional[str] = None,
    country:  Optional[str] = None,
    db:       AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    q = select(Attack).order_by(desc(Attack.timestamp))
    cq = select(func.count(Attack.id))

    if honeypot:
        q  = q.where(Attack.honeypot == honeypot)
        cq = cq.where(Attack.honeypot == honeypot)
    if country:
        q  = q.where(Attack.country_code == country)
        cq = cq.where(Attack.country_code == country)

    total  = (await db.execute(cq)).scalar_one()
    items  = (await db.execute(q.offset(offset).limit(limit))).scalars().all()
    return AttackList(total=total, page=page, limit=limit, items=items)

@router.get("/{attack_id}", response_model=AttackOut)
async def get_attack(attack_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Attack).where(Attack.id == attack_id))
    return result.scalar_one()
