from typing import Dict, Any

def path_planner_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Decides what the system should do next based on the student's mastery and recent performance.
    """
    # Simple logic for now
    mastery = state.get("mastery_level", 0)
    weak_concepts = state.get("weak_concepts", [])
    
    if len(weak_concepts) > 0:
        state["next_action"] = "teach" # Need to reteach
        state["current_difficulty"] = "beginner"
        state["recommendations"] = [f"Review {concept}" for concept in weak_concepts]
    elif mastery < 50:
        state["next_action"] = "teach"
    elif mastery < 80:
        state["next_action"] = "quiz"
        state["current_difficulty"] = "intermediate"
    else:
        state["next_action"] = "teach" # Move to next topic in a real system
        state["current_difficulty"] = "advanced"
        
    return state
