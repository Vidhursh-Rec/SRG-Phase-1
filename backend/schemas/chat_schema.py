from pydantic import BaseModel


class EvaluateRequest(BaseModel):
    user_input: str
    draft_response: str
    policy_context: str


class EvaluateResponse(BaseModel):
    approved: bool
    v1: bool
    v2: bool
    reason: str


class RefineRequest(BaseModel):
    user_input: str
    draft_response: str
    policy_context: str


class RefineResponse(BaseModel):
    final_response: str
    approved: bool
    v1: bool
    v2: bool
    reason: str
    attempts_used: int
    escalated: bool