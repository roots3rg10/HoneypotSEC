from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from database import get_db
from models import EducationArticle
from schemas import ArticleOut, ArticleDetail

router = APIRouter(prefix="/api/education", tags=["education"])

@router.get("/articles", response_model=list[ArticleOut])
async def list_articles(
    category:  Optional[str] = None,
    difficulty: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    q = select(EducationArticle).order_by(EducationArticle.id)
    if category:
        q = q.where(EducationArticle.category == category)
    if difficulty:
        q = q.where(EducationArticle.difficulty == difficulty)
    result = await db.execute(q)
    return result.scalars().all()

@router.get("/articles/{slug}", response_model=ArticleDetail)
async def get_article(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EducationArticle).where(EducationArticle.slug == slug)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return article

@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import distinct
    result = await db.execute(
        select(distinct(EducationArticle.category)).order_by(EducationArticle.category)
    )
    return [r[0] for r in result.all()]
