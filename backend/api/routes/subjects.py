from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.session import get_db
from db.models import Subject
from pydantic import BaseModel
import uuid

router = APIRouter()

class SubjectCreate(BaseModel):
    name: str
    description: str = ""
    student_id: str

class SubjectResponse(BaseModel):
    id: str
    name: str
    description: str
    student_id: str

    class Config:
        orm_mode = True

@router.post("/", response_model=SubjectResponse)
async def create_subject(subject: SubjectCreate, db: AsyncSession = Depends(get_db)):
    new_subject = Subject(
        id=str(uuid.uuid4()),
        name=subject.name,
        description=subject.description,
        student_id=subject.student_id
    )
    db.add(new_subject)
    await db.commit()
    await db.refresh(new_subject)
    return new_subject

@router.get("/{student_id}", response_model=list[SubjectResponse])
async def list_subjects(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subject).where(Subject.student_id == student_id))
    subjects = result.scalars().all()
    return subjects
