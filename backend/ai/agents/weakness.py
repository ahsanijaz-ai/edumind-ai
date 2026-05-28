from typing import Dict, Any

def weakness_agent(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes the student's weaknesses based on evaluation results.
    """
    # Logic to aggregate weaknesses and determine if we need to switch topics or reteach
    weak_concepts = state.get("weak_concepts", [])
    
    if len(weak_concepts) > 2:
        state["recommendations"] = ["Student is struggling with multiple concepts. Switching to easier foundational material."]
        state["current_difficulty"] = "beginner"
        state["next_action"] = "teach"
    else:
        state["next_action"] = "plan"
        
    return state
