from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.session import get_db
from db.models import QuizAttempt, Weakness
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class QuizAttemptResponse(BaseModel):
    id: str
    quiz_id: str
    student_id: str
    score: float
    feedback: Optional[str]

    class Config:
        orm_mode = True

class WeaknessResponse(BaseModel):
    id: str
    student_id: str
    topic_id: str
    description: str
    severity: str

    class Config:
        orm_mode = True

@router.get("/history/debug/all", response_model=List[QuizAttemptResponse])
async def get_all_history_debug(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QuizAttempt))
    attempts = result.scalars().all()
    res = []
    for a in attempts:
        res.append({
            "id": a.id,
            "quiz_id": a.quiz_id or "Unknown",
            "student_id": a.user_id,
            "score": a.score,
            "feedback": a.ai_feedback
        })
    return res

@router.get("/history/{student_id}", response_model=List[QuizAttemptResponse])
async def get_quiz_history(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QuizAttempt).where(QuizAttempt.user_id == student_id))
    attempts = result.scalars().all()
    
    # Format to match response model
    res = []
    for a in attempts:
        res.append({
            "id": a.id,
            "quiz_id": a.quiz_id or "Unknown",
            "student_id": a.user_id,
            "score": a.score,
            "feedback": a.ai_feedback
        })
    return res

@router.get("/weaknesses/{student_id}", response_model=List[WeaknessResponse])
async def get_weaknesses(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Weakness).where(Weakness.user_id == student_id))
    weaknesses = result.scalars().all()
    
    res = []
    for w in weaknesses:
        res.append({
            "id": w.id,
            "student_id": w.user_id,
            "topic_id": w.topic_id or "Unknown",
            "description": w.concept,
            "severity": "high" if w.mistake_count > 3 else "medium" if w.mistake_count > 1 else "low"
        })
    return res

class QuizAttemptCreate(BaseModel):
    quiz_id: str
    student_id: str
    score: float
    feedback: Optional[str] = None

@router.post("/history", response_model=QuizAttemptResponse)
async def create_quiz_attempt(attempt: QuizAttemptCreate, db: AsyncSession = Depends(get_db)):
    import uuid
    new_attempt = QuizAttempt(
        id=str(uuid.uuid4()),
        quiz_id=attempt.quiz_id,
        user_id=attempt.student_id,
        score=attempt.score,
        ai_feedback=attempt.feedback
    )
    db.add(new_attempt)
    await db.commit()
    await db.refresh(new_attempt)
    
    return {
        "id": new_attempt.id,
        "quiz_id": new_attempt.quiz_id,
        "student_id": new_attempt.user_id,
        "score": new_attempt.score,
        "feedback": new_attempt.ai_feedback
    }
