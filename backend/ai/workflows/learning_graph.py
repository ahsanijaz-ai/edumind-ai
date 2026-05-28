from typing import TypedDict, List, Optional, Any
from langgraph.graph import StateGraph, END
from pydantic import BaseModel

class AgentState(TypedDict):
    student_id: str
    current_topic: str
    current_difficulty: str
    mastery_level: int
    weak_concepts: List[str]
    quiz_scores: List[int]
    recent_performance: str # "improving", "struggling", "steady"
    recommendations: List[str]
    ai_feedback: str
    messages: List[Any] # chat history
    next_action: str # "teach", "quiz", "evaluate", "plan"

from ai.agents import teaching_agent, quiz_agent, evaluator_agent, path_planner_agent

def build_learning_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("teaching_node", teaching_agent)
    workflow.add_node("quiz_node", quiz_agent)
    workflow.add_node("evaluator_node", evaluator_agent)
    workflow.add_node("path_planner_node", path_planner_agent)
    
    # Edges
    workflow.set_entry_point("path_planner_node")
    
    # Conditional edge from planner
    workflow.add_conditional_edges(
        "path_planner_node",
        lambda x: x.get("next_action", "teach"),
        {
            "teach": "teaching_node",
            "quiz": "quiz_node",
            "evaluate": "evaluator_node"
        }
    )
    
    # Standard edges
    workflow.add_edge("teaching_node", END) # Or back to planner if we want a loop
    workflow.add_edge("quiz_node", END)
    workflow.add_edge("evaluator_node", "path_planner_node")
    
    return workflow.compile()

learning_graph = build_learning_graph()
