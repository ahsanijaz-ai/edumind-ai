from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List
from core.config import settings
import json

class QuizQuestionModel(BaseModel):
    question_text: str = Field(description="The question to ask")
    options: List[str] = Field(description="List of 4 options for MCQ")
    correct_answer: str = Field(description="The exact string of the correct option")
    explanation: str = Field(description="Why this answer is correct")

class QuizModel(BaseModel):
    questions: List[QuizQuestionModel] = Field(description="List of generated questions")

def get_structured_llm():
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.4
    )
    return llm.with_structured_output(QuizModel)

def quiz_agent(state: dict) -> dict:
    llm = get_structured_llm()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert assessment creator. Generate a quiz with exactly {num_questions} questions to test the student's knowledge.\n"
                   "Source Documents: {source_names}\n"
                   "Topic/Content: {current_topic}\n"
                   "Difficulty: {current_difficulty}\n"
                   "Focus on their weak areas if any: {weak_concepts}\n"),
        ("human", "Generate the quiz.")
    ])
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "current_topic": state.get("current_topic", "General Knowledge"),
            "current_difficulty": state.get("current_difficulty", "beginner"),
            "weak_concepts": ", ".join(state.get("weak_concepts", [])),
            "num_questions": state.get("num_questions", 5),
            "source_names": ", ".join(state.get("source_names", []))
        })
        state["ai_feedback"] = response.model_dump_json()
    except Exception as e:
        state["ai_feedback"] = json.dumps({"error": str(e)})
        
    state["next_action"] = "evaluate"
    return state
