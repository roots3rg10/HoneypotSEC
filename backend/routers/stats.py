from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, text, distinct
from datetime import datetime, timezone, timedelta
from database import get_db
from models import Attack
from schemas import SummaryStats, TimelinePoint, HoneypotStat, CountryStat, TopIP, TopPort

router = APIRouter(prefix="/api/stats", tags=["stats"])

@router.get("/summary", response_model=SummaryStats)
async def summary(db: AsyncSession = Depends(get_db)):
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    total        = (await db.execute(select(func.count(Attack.id)))).scalar_one()
    unique_ips   = (await db.execute(select(func.count(distinct(Attack.source_ip))))).scalar_one()
    today_count  = (await db.execute(
        select(func.count(Attack.id)).where(Attack.timestamp >= today)
    )).scalar_one()

    top_hp_row = (await db.execute(
        select(Attack.honeypot, func.count(Attack.id).label("c"))
        .group_by(Attack.honeypot).order_by(desc("c")).limit(1)
    )).first()

    top_country_row = (await db.execute(
        select(Attack.country, func.count(Attack.id).label("c"))
        .where(Attack.country.isnot(None))
        .group_by(Attack.country).order_by(desc("c")).limit(1)
    )).first()

    top_type_row = (await db.execute(
        select(Attack.attack_type, func.count(Attack.id).label("c"))
        .where(Attack.attack_type.isnot(None))
        .group_by(Attack.attack_type).order_by(desc("c")).limit(1)
    )).first()

    return SummaryStats(
        total_attacks   = total,
        unique_ips      = unique_ips,
        attacks_today   = today_count,
        top_honeypot    = top_hp_row[0] if top_hp_row else None,
        top_country     = top_country_row[0] if top_country_row else None,
        top_attack_type = top_type_row[0] if top_type_row else None,
    )

@router.get("/timeline", response_model=list[TimelinePoint])
async def timeline(
    honeypot: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    if honeypot:
        rows = (await db.execute(text("""
            SELECT to_char(date_trunc('hour', timestamp), 'YYYY-MM-DD HH24:00') AS hour,
                   count(*) AS count
            FROM attacks
            WHERE timestamp >= NOW() - INTERVAL '24 hours'
              AND honeypot = :honeypot
            GROUP BY hour
            ORDER BY hour
        """), {"honeypot": honeypot})).all()
    else:
        rows = (await db.execute(text("""
            SELECT to_char(date_trunc('hour', timestamp), 'YYYY-MM-DD HH24:00') AS hour,
                   count(*) AS count
            FROM attacks
            WHERE timestamp >= NOW() - INTERVAL '24 hours'
            GROUP BY hour
            ORDER BY hour
        """))).all()
    return [TimelinePoint(hour=r[0], count=r[1]) for r in rows]

@router.get("/honeypots", response_model=list[HoneypotStat])
async def honeypot_stats(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(Attack.honeypot, func.count(Attack.id).label("c"))
        .group_by(Attack.honeypot).order_by(desc("c"))
    )).all()
    return [HoneypotStat(honeypot=r[0], count=r[1]) for r in rows]

@router.get("/countries", response_model=list[CountryStat])
async def country_stats(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(
            Attack.country,
            Attack.country_code,
            func.count(Attack.id).label("c"),
            func.avg(Attack.latitude).label("lat"),
            func.avg(Attack.longitude).label("lon"),
        )
        .where(Attack.country.isnot(None))
        .group_by(Attack.country, Attack.country_code)
        .order_by(desc("c"))
        .limit(50)
    )).all()
    return [CountryStat(country=r[0], country_code=r[1], count=r[2], latitude=r[3], longitude=r[4]) for r in rows]

@router.get("/top-ips", response_model=list[TopIP])
async def top_ips(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(Attack.source_ip, func.count(Attack.id).label("c"), Attack.country)
        .group_by(Attack.source_ip, Attack.country)
        .order_by(desc("c"))
        .limit(20)
    )).all()
    return [TopIP(source_ip=r[0], count=r[1], country=r[2]) for r in rows]

@router.get("/top-ports", response_model=list[TopPort])
async def top_ports(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(Attack.dest_port, func.count(Attack.id).label("c"))
        .where(Attack.dest_port.isnot(None))
        .group_by(Attack.dest_port)
        .order_by(desc("c"))
        .limit(15)
    )).all()
    return [TopPort(dest_port=r[0], count=r[1]) for r in rows]

@router.get("/overview")
async def overview(db: AsyncSession = Depends(get_db)):
    top_ips = (await db.execute(
        select(Attack.source_ip, func.count(Attack.id).label("c"), Attack.country)
        .group_by(Attack.source_ip, Attack.country)
        .order_by(desc("c")).limit(10)
    )).all()

    top_ports = (await db.execute(
        select(Attack.dest_port, func.count(Attack.id).label("c"))
        .where(Attack.dest_port.isnot(None))
        .group_by(Attack.dest_port)
        .order_by(desc("c")).limit(10)
    )).all()

    top_countries = (await db.execute(
        select(Attack.country, Attack.country_code, func.count(Attack.id).label("c"))
        .where(Attack.country.isnot(None))
        .group_by(Attack.country, Attack.country_code)
        .order_by(desc("c")).limit(5)
    )).all()

    protocols = (await db.execute(
        select(Attack.protocol, func.count(Attack.id).label("c"))
        .where(Attack.protocol.isnot(None))
        .group_by(Attack.protocol)
        .order_by(desc("c"))
    )).all()

    return {
        "top_ips":       [{"ip": r[0], "count": r[1], "country": r[2]} for r in top_ips],
        "top_ports":     [{"port": r[0], "count": r[1]} for r in top_ports],
        "top_countries": [{"country": r[0], "code": r[1], "count": r[2]} for r in top_countries],
        "protocols":     [{"protocol": r[0], "count": r[1]} for r in protocols],
    }
