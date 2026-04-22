from typing import Any, Dict

from typing_extensions import NotRequired, TypedDict


class WorkflowState(TypedDict):
    image: Any
    crop_result: NotRequired[Dict[str, Any]]
    disease_result: NotRequired[Dict[str, Any]]
    route_decision: NotRequired[str]
    success: NotRequired[bool]
    error: NotRequired[str]
