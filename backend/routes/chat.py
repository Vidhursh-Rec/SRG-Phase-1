from fastapi import APIRouter

from pydantic import BaseModel

from schemas.chat_schema import (
    EvaluateRequest,
    EvaluateResponse,
    RefineRequest,
    RefineResponse,
)

from srg.response_refiner import refine as run_refine, _run_both_gates
from srg.utils import GroqLLMClient
from srg.policy_retriever import PolicyRetriever


router = APIRouter(tags=["chat"])

llm = GroqLLMClient()
policy_retriever = PolicyRetriever()
policy_retriever.load_index()


class ChatRequest(BaseModel):
    user_input: str


class ChatResponse(BaseModel):
    final_response: str
    approved: bool
    v1: bool
    v2: bool
    reason: str
    attempts_used: int
    escalated: bool


def generate_draft(user_input: str, policy_context: str) -> str:
    prompt = f"""
You are a customer support chatbot.

Answer the customer's question using the policy information below.

Policy information:
{policy_context}

Customer question:
{user_input}

Provide a helpful, professional customer-facing response.
Do not mention internal policy documents.
Return ONLY the response to the customer.
"""

    return llm.generate(prompt, max_tokens=500).strip()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    # 1. Retrieve relevant policy
    policy_chunks = policy_retriever.retrieve(
        request.user_input,
        k=3,
    )

    policy_context = "\n\n".join(policy_chunks)

    # 2. Generate initial response
    draft_response = generate_draft(
        request.user_input,
        policy_context,
    )

    # 3. Run SRG refinement pipeline
    result = run_refine(
        user_input=request.user_input,
        draft_response=draft_response,
        policy_context=policy_context,
        llm=llm,
    )

    # 4. Return final result to frontend
    return ChatResponse(
        final_response=result.final_response,
        approved=result.approved,
        v1=result.v1,
        v2=result.v2,
        reason=result.reason,
        attempts_used=result.attempts_used,
        escalated=result.escalated,
    )


@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate(request: EvaluateRequest):

    verdict = _run_both_gates(
        user_input=request.user_input,
        draft_response=request.draft_response,
        policy_context=request.policy_context,
        llm=llm,
    )

    return EvaluateResponse(
        approved=verdict.approved,
        v1=verdict.v1,
        v2=verdict.v2,
        reason=verdict.reason,
    )


@router.post("/refine", response_model=RefineResponse)
def refine(request: RefineRequest):

    result = run_refine(
        user_input=request.user_input,
        draft_response=request.draft_response,
        policy_context=request.policy_context,
        llm=llm,
    )

    return RefineResponse(
        final_response=result.final_response,
        approved=result.approved,
        v1=result.v1,
        v2=result.v2,
        reason=result.reason,
        attempts_used=result.attempts_used,
        escalated=result.escalated,
    )