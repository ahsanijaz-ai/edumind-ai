from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from core.config import settings
import json

class EvaluationResult(BaseModel):
    is_correct: bool = Field(description="Whether the student's answer is correct")
    score: int = Field(description="Score out of 100 for this answer")
    explanation: str = Field(description="Explanation of the correct concept")
    detected_weakness: str = Field(description="Any specific concept the student seems to struggle with, or empty string")

def get_evaluator_llm():
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2
    )
    return llm.with_structured_output(EvaluationResult)

def evaluator_agent(state: dict) -> dict:
    # In a real scenario, this would take the student's actual answer from the state messages
    # For now, we simulate evaluating the latest message from the user
    llm = get_evaluator_llm()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert tutor grading a student's answer.\n"
                   "Topic: {current_topic}\n"
                   "Evaluate their answer carefully. Identify if they have any conceptual misunderstandings."),
        ("human", "My answer: {student_answer}")
    ])
    
    chain = prompt | llm
    
    student_answer = "I don't know" # Placeholder, this would be extracted from state.messages
    if state.get("messages") and len(state["messages"]) > 0:
        student_answer = state["messages"][-1]
    
    try:
        response = chain.invoke({
            "current_topic": state.get("current_topic", "General Knowledge"),
            "student_answer": student_answer
        })
        
        # Update state based on evaluation
        if not response.is_correct and response.detected_weakness:
            if "weak_concepts" not in state:
                state["weak_concepts"] = []
            if response.detected_weakness not in state["weak_concepts"]:
                state["weak_concepts"].append(response.detected_weakness)
                
        state["ai_feedback"] = response.model_dump_json()
        
    except Exception as e:
        state["ai_feedback"] = json.dumps({"error": str(e)})
        
    state["next_action"] = "plan"
    return state
