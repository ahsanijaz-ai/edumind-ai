from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from pydantic import BaseModel
from typing import List, Optional
from ai.workflows.learning_graph import learning_graph

router = APIRouter()

class ChatRequest(BaseModel):
    student_id: str
    message: str
    subject_id: Optional[str] = None
    current_difficulty: str = "beginner"
    mastery_level: int = 0
    weak_concepts: List[str] = []

class ChatResponse(BaseModel):
    response: str
    next_action: str
    updated_weak_concepts: List[str]
    current_difficulty: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_tutor(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.future import select
    from db.models import UploadedDocument
    import os, PyPDF2

    context_text = "General Knowledge"
    if request.subject_id:
        result = await db.execute(select(UploadedDocument).where(UploadedDocument.subject_id == request.subject_id))
        docs = result.scalars().all()
        extracted = ""
        for doc in docs:
            file_path = doc.file_path
            if os.path.exists(file_path):
                if file_path.endswith('.pdf'):
                    try:
                        with open(file_path, 'rb') as f:
                            reader = PyPDF2.PdfReader(f)
                            for page in reader.pages:
                                text = page.extract_text()
                                if text: extracted += text + "\n"
                    except: pass
                elif file_path.endswith('.txt'):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            extracted += f.read() + "\n"
                    except: pass
        if extracted:
            context_text = extracted[:50000] # Limit context

    initial_state = {
        "student_id": request.student_id,
        "current_topic": context_text,
        "current_difficulty": request.current_difficulty,
        "mastery_level": request.mastery_level,
        "weak_concepts": request.weak_concepts,
        "quiz_scores": [],
        "recent_performance": "steady",
        "recommendations": [],
        "ai_feedback": "",
        "messages": [request.message],
        "next_action": "teach" # Start with teach directly for chat
    }
    
    try:
        final_state = learning_graph.invoke(initial_state)
        
        return ChatResponse(
            response=final_state.get("ai_feedback", "I am sorry, I couldn't process that."),
            next_action=final_state.get("next_action", "teach"),
            updated_weak_concepts=final_state.get("weak_concepts", []),
            current_difficulty=final_state.get("current_difficulty", request.current_difficulty)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
