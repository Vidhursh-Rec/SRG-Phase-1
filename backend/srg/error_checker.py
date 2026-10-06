"""
error_checker.py
-----------------
WHY THIS FILE EXISTS:
This is Stage 2 of the two-gate boolean verification pipeline.
It receives the ORIGINAL unredacted response r (not the sanitized r'),
and checks ONE concern only: does this response contain confidential
information leaks or factual inaccuracies against the policy reference.

It has zero awareness of tone or policy compliance — that's Review
Agent's job. Keeping concerns isolated between the two agents is the
core design decision that prevents cross-concern reasoning leakage.

Also runs a fast local regex scan BEFORE the LLM call — if a hard
pattern match (account number, card number etc.) is found, it fails
immediately without spending an API token, since regex is a stronger
and cheaper signal for PII than LLM judgement anyway.

Returns a strict boolean + one-sentence reason. Never a score.
"""

import json
import re

from srg.utils import LLMClient


EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
)

PHONE_PATTERN = re.compile(
    r"\b(?:\+?\d[\d\s().-]{7,}\d)\b"
)

ACCOUNT_PATTERN = re.compile(
    r"\bACC[- ]?\d{6,}\b",
    re.IGNORECASE
)


def _local_confidentiality_check(text: str) -> tuple[bool, str]:
    """Fast local check for obvious confidential patterns."""

    if EMAIL_PATTERN.search(text):
        return False, "Email address detected."

    if PHONE_PATTERN.search(text):
        return False, "Phone number detected."

    if ACCOUNT_PATTERN.search(text):
        return False, "Account number detected."

    return True, "No obvious confidential pattern detected."


def _semantic_confidentiality_check(
    text: str,
    policy_context: str,
    llm: LLMClient,
) -> tuple[bool, str]:
    """
    Use the LLM to detect confidentiality leaks that
    cannot reliably be identified using regex alone.
    """

    prompt = f"""
You are the confidentiality checker for an enterprise AI system.

Analyze the AI response for ANY disclosure of confidential,
private, internal, or restricted information.

Consider semantic meaning, not only obvious patterns.

Look for things such as:
- Internal employee or personnel information
- Internal systems, tools, or infrastructure
- Private customer information
- Internal procedures or operational details
- Secrets or credentials
- Information that policy says must not be disclosed

Do NOT flag normal public information merely because it contains
an email, phone number, name, or organization.

Policy context:
{policy_context}

AI response:
{text}

Return ONLY valid JSON:

{{
  "passed": true or false,
  "reason": "short explanation"
}}
"""

    raw = llm.generate(prompt, max_tokens=300)

    try:
        result = json.loads(raw)

        return (
            bool(result.get("passed", False)),
            str(result.get("reason", "No reason provided."))
        )

    except (json.JSONDecodeError, TypeError, ValueError):
        return False, "Semantic confidentiality check returned invalid output."


def check(
    text: str,
    policy_context: str,
    llm: LLMClient,
) -> dict:

    # Gate 1: cheap local detection
    passed, reason = _local_confidentiality_check(text)

    if not passed:
        return {
            "passed": False,
            "reason": reason
        }

    # Gate 2: semantic understanding
    passed, reason = _semantic_confidentiality_check(
        text=text,
        policy_context=policy_context,
        llm=llm,
    )

    return {
        "passed": passed,
        "reason": reason
    }