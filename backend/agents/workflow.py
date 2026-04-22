import logging
from uuid import uuid4

from PIL import Image
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph

from .disease_agent import disease_detector_node
from .router_agent import crop_classifier_node
from .state import WorkflowState

logger = logging.getLogger(__name__)


def error_handler_node(state: WorkflowState) -> dict:
    """Set workflow error state when routing decides not to continue."""
    crop_result = state.get("crop_result", {})
    confidence = 0.0

    if isinstance(crop_result, dict):
        confidence = float(crop_result.get("confidence", 0.0))

    error_message = (
        state.get("error")
        or f"Crop confidence below threshold; received confidence={confidence:.4f}."
    )

    logger.warning("Workflow routed to error handler: %s", error_message)
    return {
        "success": False,
        "error": error_message,
    }


def route_after_crop(state: WorkflowState) -> str:
    """Return conditional route key after crop classification node."""
    decision = state.get("route_decision", "error")
    return "continue" if decision == "continue" else "error"


def _build_workflow_app() -> object:
    """Build and compile the LangGraph workflow with memory checkpointing."""
    graph = StateGraph(WorkflowState)

    graph.add_node("crop_classifier", crop_classifier_node)
    graph.add_node("disease_detector", disease_detector_node)
    graph.add_node("error_handler", error_handler_node)

    graph.set_entry_point("crop_classifier")
    graph.add_conditional_edges(
        "crop_classifier",
        route_after_crop,
        {
            "continue": "disease_detector",
            "error": "error_handler",
        },
    )

    graph.add_edge("disease_detector", END)
    graph.add_edge("error_handler", END)

    return graph.compile()


app = _build_workflow_app()


def run_workflow(image: Image.Image) -> dict:
    """Invoke the compiled workflow graph and return the final workflow state."""
    initial_state: WorkflowState = {"image": image}

    try:
        final_state = app.invoke(initial_state)
        if isinstance(final_state, dict):
            return final_state

        # Defensive fallback in case runtime returns a mapping-like object.
        return dict(final_state)
    except Exception as exc:
        logger.error("Workflow execution failed: %s", exc, exc_info=True)
        return {
            "success": False,
            "error": f"Workflow execution failed: {exc}",
        }
