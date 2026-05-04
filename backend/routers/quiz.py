from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import QuizQuestion, QuizResult, User
from schemas import QuizQuestionOut, QuizSubmit, QuizResultOut, AdminQuizResultRow
from security import get_current_user
from dependencies import require_admin

router = APIRouter(prefix="/api/education", tags=["quiz"])


@router.get("/articles/{slug}/quiz", response_model=list[QuizQuestionOut])
async def get_quiz(
    slug: str,
    db:   AsyncSession = Depends(get_db),
    _:    User = Depends(get_current_user),
):
    result = await db.execute(
        select(QuizQuestion)
        .where(QuizQuestion.article_slug == slug)
        .order_by(QuizQuestion.order_num)
    )
    questions = result.scalars().all()
    if not questions:
        raise HTTPException(status_code=404, detail="Quiz no encontrado para este artículo")
    return questions


@router.post("/articles/{slug}/quiz", response_model=QuizResultOut)
async def submit_quiz(
    slug:         str,
    body:         QuizSubmit,
    db:           AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(QuizQuestion)
        .where(QuizQuestion.article_slug == slug)
        .order_by(QuizQuestion.order_num)
    )
    questions = result.scalars().all()
    if not questions:
        raise HTTPException(status_code=404, detail="Quiz no encontrado")

    if len(body.answers) != len(questions):
        raise HTTPException(
            status_code=422,
            detail=f"Se esperaban {len(questions)} respuestas, se recibieron {len(body.answers)}"
        )

    score   = 0
    details = []
    for q, given in zip(questions, body.answers):
        correct = given == q.correct_index
        if correct:
            score += 1
        details.append({
            "question":      q.question,
            "given":         given,
            "correct_index": q.correct_index,
            "correct":       correct,
        })

    max_score = len(questions)
    passed    = (score / max_score) >= 0.7

    db.add(QuizResult(
        user_id      = current_user.id,
        article_slug = slug,
        score        = score,
        max_score    = max_score,
    ))
    await db.commit()

    return QuizResultOut(score=score, max_score=max_score, passed=passed, details=details)


@router.get("/quiz-results/all", response_model=list[AdminQuizResultRow])
async def all_quiz_results(
    db:   AsyncSession = Depends(get_db),
    _:    User = Depends(require_admin),
):
    rows = (await db.execute(
        select(
            QuizResult.id,
            QuizResult.user_id,
            User.username,
            QuizResult.article_slug,
            QuizResult.score,
            QuizResult.max_score,
            QuizResult.completed_at,
        )
        .join(User, User.id == QuizResult.user_id)
        .order_by(QuizResult.completed_at.desc())
    )).all()

    return [
        AdminQuizResultRow(
            id           = r.id,
            user_id      = r.user_id,
            username     = r.username,
            article_slug = r.article_slug,
            score        = r.score,
            max_score    = r.max_score,
            completed_at = r.completed_at,
        )
        for r in rows
    ]
