"""
review_agent.py
----------------
WHY THIS FILE EXISTS:
This is Stage 1 of the two-gate boolean verification pipeline.
It receives ONLY the redacted response r' (never the original),
and checks ONE concern only: does this response comply with company
policy, is the tone appropriate, is it complete enough to be useful.

It has zero awareness of confidentiality — that's Error Checker's job.
Keeping it blind to confidentiality is the whole point: prevents
reasoning leakage where the model starts thinking about what was
redacted even when asked not to.

Returns a strict boolean + one-sentence reason. Never a score.
Decision of approve/deny is made in code (response_refiner.py),
not by this agent's own words.
"""

import json
from srg.utils import LLMClient


REVIEW_PROMPT = """You are a policy and tone compliance checker for a customer support chatbot.

Company policy reference:
{policy_context}

Bot's draft response (sensitive content already removed):
{redacted_response}

Your job: check ONLY whether this response:
1. Complies with the company policy reference above
2. Uses an appropriate, professional tone
3. Is complete enough to actually help the customer

Do NOT check for confidential information — that is handled separately.
Do NOT mention anything about redacted content.

Respond ONLY as valid JSON, nothing else:
{{"passed": true or false, "reason": "<one sentence explaining your verdict>"}}
"""


def _safe_parse(raw: str) -> dict:
    """
    Strips markdown fences if LLM wraps JSON in them,
    then parses. Falls back to a safe flagged verdict if
    parsing fails — never silently passes a broken response.
    """
    cleaned = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "passed": False,
            "reason": "Review Agent returned unparsable output — flagged for safety.",
        }


def check(redacted_response: str, policy_context: str, llm: LLMClient) -> dict:
    """
    Main entry point called by response_refiner._run_both_gates().
    Returns: {"passed": bool, "reason": str}
    """
    prompt = REVIEW_PROMPT.format(
        policy_context=policy_context,
        redacted_response=redacted_response,
    )
    raw = llm.generate(prompt)
    print("\n--- REVIEW PROMPT ---")
    print(prompt)
    print("--- REVIEW RAW RESPONSE ---")
    print(raw)
    print("----------------------\n")
    result = _safe_parse(raw)
    return {
        "passed": bool(result.get("passed", False)),
        "reason": result.get("reason", "No reason provided."),
    }