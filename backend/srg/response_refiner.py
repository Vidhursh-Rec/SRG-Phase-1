"""
response_refiner.py
--------------------
WHAT CHANGED FROM PHASE 1:
Previously called decision_engine.evaluate() — a single combined judge.
Now calls the two isolated gates (review_agent + error_checker) separately,
combines their boolean verdicts in code (approve = v1 AND v2), and loops
the same way as before — max 2 rewrite attempts before escalating.

WHY: splitting into two blind agents prevents reasoning leakage across
concerns (policy bleeding into confidentiality judgement and vice versa).
The loop logic itself is unchanged — only what it calls internally changed.
"""

from dataclasses import dataclass
from srg.utils import LLMClient


@dataclass
class GateVerdict:
    v1: bool          # Review Agent: policy + tone
    v2: bool          # Error Checker: facts + confidentiality
    v1_reason: str
    v2_reason: str

    @property
    def approved(self) -> bool:
        return self.v1 and self.v2

    @property
    def reason(self) -> str:
        reasons = []
        if not self.v1:
            reasons.append(f"Review Agent: {self.v1_reason}")
        if not self.v2:
            reasons.append(f"Error Checker: {self.v2_reason}")
        return " | ".join(reasons) if reasons else "All checks passed."


@dataclass
class RefineResult:
    final_response: str
    approved: bool
    v1: bool
    v2: bool
    reason: str
    attempts_used: int
    escalated: bool


REFINE_PROMPT = """Your previous response was flagged by a compliance checker.
Reason: {reason}

Policy reference: {policy_context}
Original customer question: {user_input}
Your previous (flagged) response: {previous_response}

Rewrite your response so it complies with policy and no longer contains
the flagged issue, while still helpfully addressing the customer's question.
Do not mention internal policy document names to the customer.
Respond with ONLY the rewritten customer-facing message, nothing else.
"""

MAX_ATTEMPTS = 2


def _run_both_gates(
    user_input: str,
    draft_response: str,
    policy_context: str,
    llm: LLMClient,
) -> GateVerdict:
    """
    Runs Review Agent and Error Checker.
    Imported here (not at top of file) to avoid circular imports since
    review_agent and error_checker also import from utils.
    """
    from srg.review_agent import check as review_check
    from srg.error_checker import check as error_check
    from srg.redactor import redact

    redacted = redact(draft_response, policy_context)

    v1_result = review_check(redacted, policy_context, llm)
    v2_result = error_check(draft_response, policy_context, llm)

    return GateVerdict(
        v1=v1_result["passed"],
        v2=v2_result["passed"],
        v1_reason=v1_result["reason"],
        v2_reason=v2_result["reason"],
    )


def refine(
    user_input: str,
    draft_response: str,
    policy_context: str,
    llm: LLMClient,
) -> RefineResult:
    """
    Main entry point. Evaluates draft through both gates.
    If denied, rewrites using the failing gate's reason and re-checks.
    Max 2 attempts before escalating to human.
    """
    current_response = draft_response
    verdict = _run_both_gates(user_input, current_response, policy_context, llm)

    attempts = 0
    while not verdict.approved and attempts < MAX_ATTEMPTS:
        attempts += 1
        prompt = REFINE_PROMPT.format(
            reason=verdict.reason,
            policy_context=policy_context,
            user_input=user_input,
            previous_response=current_response,
        )
        current_response = llm.generate(prompt)
        verdict = _run_both_gates(user_input, current_response, policy_context, llm)

    escalated = not verdict.approved

    return RefineResult(
        final_response=current_response,
        approved=verdict.approved,
        v1=verdict.v1,
        v2=verdict.v2,
        reason=verdict.reason,
        attempts_used=attempts,
        escalated=escalated,
    )