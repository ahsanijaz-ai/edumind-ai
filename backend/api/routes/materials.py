from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.session import get_db
from db.models import UploadedDocument
from pydantic import BaseModel
import uuid
import os
import shutil

router = APIRouter()

from typing import Optional

class DocumentResponse(BaseModel):
    id: str
    filename: str
    subject_id: str
    student_id: str
    content_type: Optional[str] = None

    class Config:
        orm_mode = True

# Ensure an upload directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentResponse)
async def upload_material(
    subject_id: str = Form(...),
    student_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    import traceback
    try:
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        new_doc = UploadedDocument(
            id=file_id,
            filename=file.filename,
            file_path=file_path,
            content_type=file.content_type,
            subject_id=subject_id,
            student_id=student_id
        )
        
        db.add(new_doc)
        await db.commit()
        await db.refresh(new_doc)
        
        return new_doc
    except Exception as e:
        print(f"ERROR IN UPLOAD: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{subject_id}", response_model=list[DocumentResponse])
async def list_materials(subject_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UploadedDocument).where(UploadedDocument.subject_id == subject_id))
    docs = result.scalars().all()
    return docs
