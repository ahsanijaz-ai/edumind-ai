from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from pydantic import BaseModel
from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from core.config import settings
import os

router = APIRouter()

# In-memory conversation history per student+subject session
# Key: f"{student_id}_{subject_id or 'general'}"
conversation_history: dict = {}

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

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.7
    )

async def get_subject_context(subject_id: str, db: AsyncSession) -> str:
    """Extract text from uploaded documents for a subject."""
    try:
        from sqlalchemy.future import select
        from db.models import UploadedDocument
        import PyPDF2

        result = await db.execute(
            select(UploadedDocument).where(UploadedDocument.subject_id == subject_id)
        )
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
                                if text:
                                    extracted += text + "\n"
                    except Exception:
                        pass
                elif file_path.endswith(('.txt', '.docx')):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            extracted += f.read() + "\n"
                    except Exception:
                        pass
        return extracted[:40000] if extracted else ""
    except Exception:
        return ""


@router.post("/chat", response_model=ChatResponse)
async def chat_with_tutor(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    llm = get_llm()

    session_key = f"{request.student_id}_{request.subject_id or 'general'}"

    # Initialize history for this session if it doesn't exist
    if session_key not in conversation_history:
        conversation_history[session_key] = []

    history = conversation_history[session_key]

    # Build system prompt
    weak_str = ", ".join(request.weak_concepts) if request.weak_concepts else "none identified yet"

    if request.subject_id:
        context = await get_subject_context(request.subject_id, db)
        if context:
            system_prompt = (
                "You are EduMind AI, an expert and friendly personal tutor. "
                "You have access to the student's uploaded course materials below. "
                "Answer questions conversationally, use examples and analogies, and always refer to the provided materials when relevant.\n\n"
                f"--- COURSE MATERIALS ---\n{context}\n--- END OF MATERIALS ---\n\n"
                f"Student difficulty level: {request.current_difficulty}\n"
                f"Student weak areas: {weak_str}\n\n"
                "Keep responses clear, helpful, and conversational. "
                "If the student asks something not covered in the materials, use your general knowledge but mention it."
            )
        else:
            system_prompt = (
                "You are EduMind AI, an expert and friendly personal tutor. "
                "The student hasn't uploaded any materials yet for this subject. "
                "Answer their questions using your general knowledge. "
                "Encourage them to upload PDFs or documents so you can give more specific help.\n\n"
                f"Student difficulty level: {request.current_difficulty}\n"
                f"Student weak areas: {weak_str}"
            )
    else:
        system_prompt = (
            "You are EduMind AI, a friendly and knowledgeable AI study assistant. "
            "Help students with any academic questions, explain concepts clearly, "
            "use examples and analogies, and encourage good study habits. "
            "Be conversational, supportive, and thorough in your explanations.\n\n"
            f"Student difficulty level: {request.current_difficulty}\n"
            f"Student weak areas: {weak_str}"
        )

    # Build the messages list for the LLM
    messages = [SystemMessage(content=system_prompt)]

    # Add conversation history (last 10 exchanges to stay within context limits)
    for h in history[-20:]:
        if h["role"] == "user":
            messages.append(HumanMessage(content=h["content"]))
        else:
            messages.append(AIMessage(content=h["content"]))

    # Add the current user message
    messages.append(HumanMessage(content=request.message))

    try:
        response = llm.invoke(messages)
        ai_reply = response.content

        # Save to history
        history.append({"role": "user", "content": request.message})
        history.append({"role": "ai", "content": ai_reply})

        # Keep history manageable (max 40 messages = 20 exchanges)
        if len(history) > 40:
            conversation_history[session_key] = history[-40:]

        return ChatResponse(
            response=ai_reply,
            next_action="teach",
            updated_weak_concepts=request.weak_concepts,
            current_difficulty=request.current_difficulty
        )

    except Exception as e:
        return ChatResponse(
            response=f"I'm having trouble connecting right now. Please try again in a moment. (Error: {str(e)[:100]})",
            next_action="teach",
            updated_weak_concepts=request.weak_concepts,
            current_difficulty=request.current_difficulty
        )


@router.delete("/chat/{student_id}/clear")
async def clear_chat_history(student_id: str, subject_id: Optional[str] = None):
    """Clear conversation history for a student session."""
    session_key = f"{student_id}_{subject_id or 'general'}"
    if session_key in conversation_history:
        del conversation_history[session_key]
    return {"status": "cleared"}
