from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from core.config import settings

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.7
    )

def teaching_agent(state: dict) -> dict:
    llm = get_llm()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert AI tutor for EduMind. You explain concepts simply, use analogies, and adapt to the student's level.\n"
                   "Current Topic: {current_topic}\n"
                   "Difficulty Level: {current_difficulty}\n"
                   "Student's Weak Concepts: {weak_concepts}\n\n"
                   "If the student is weak, simplify explanations and add more examples. If they are advanced, be concise and complex."),
        ("human", "Please teach me about this topic.")
    ])
    
    chain = prompt | llm
    
    response = chain.invoke({
        "current_topic": state.get("current_topic", "General Knowledge"),
        "current_difficulty": state.get("current_difficulty", "beginner"),
        "weak_concepts": ", ".join(state.get("weak_concepts", []))
    })
    
    state["ai_feedback"] = response.content
    state["next_action"] = "quiz" # Typically quiz after teaching
    return state
