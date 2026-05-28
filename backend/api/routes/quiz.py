from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.session import get_db
from db.models import UploadedDocument
from pydantic import BaseModel
import os
import PyPDF2
from ai.agents.quiz import quiz_agent
import json

from typing import List, Optional

router = APIRouter()

class GenerateQuizRequest(BaseModel):
    subject_id: str
    student_id: str
    difficulty: str = "medium"
    num_questions: int = 5
    doc_ids: Optional[List[str]] = None

class QuizResponse(BaseModel):
    quiz: dict

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(request: GenerateQuizRequest, db: AsyncSession = Depends(get_db)):
    # 1. Fetch documents for this subject
    query = select(UploadedDocument).where(UploadedDocument.subject_id == request.subject_id)
    if request.doc_ids:
        query = query.where(UploadedDocument.id.in_(request.doc_ids))
    result = await db.execute(query)
    docs = result.scalars().all()

    if not docs:
        raise HTTPException(status_code=400, detail="No materials found for this subject to base the quiz on.")

    # 2. Extract text from documents
    combined_text = ""
    for doc in docs:
        file_path = doc.file_path
        if os.path.exists(file_path):
            if file_path.endswith('.pdf'):
                try:
                    with open(file_path, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        for page in reader.pages:
                            text = page.extract_text()
                            if text:
                                combined_text += text + "\n"
                except Exception as e:
                    print(f"Error reading PDF {file_path}: {e}")
            elif file_path.endswith('.txt'):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        combined_text += f.read() + "\n"
                except Exception as e:
                    print(f"Error reading TXT {file_path}: {e}")

    if not combined_text.strip():
         raise HTTPException(status_code=400, detail="Could not extract any text from the uploaded materials.")

    # Truncate text to avoid massive token costs if extremely large, Gemini can handle a lot but let's keep it reasonable
    MAX_CHARS = 100000 
    if len(combined_text) > MAX_CHARS:
        combined_text = combined_text[:MAX_CHARS]

    # 3. Call the LangChain Quiz Agent
    source_names = [d.filename for d in docs]
    state = {
        "current_topic": combined_text,
        "current_difficulty": request.difficulty,
        "weak_concepts": [],
        "num_questions": request.num_questions,
        "source_names": source_names
    }
    
    try:
        new_state = quiz_agent(state)
        quiz_json_str = new_state.get("ai_feedback", "{}")
        quiz_data = json.loads(quiz_json_str)
        return QuizResponse(quiz=quiz_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
