"""
redactor.py
------------
WHY THIS FILE EXISTS:
Review Agent should never see confidentiality-shaped content — not because
it checks for leaks (that's Error Checker's job) but because seeing sensitive
content can bias its policy/tone reasoning in ways that are hard to detect.

This file runs BEFORE Review Agent, on every draft response. It finds
PII-shaped patterns (same ones confidential_detector used to have) and
rewrites them naturally — not with a visible [REDACTED] tag, but with a
generic phrase so the sentence still reads normally.

Runs entirely locally — no LLM call, no API cost, runs in milliseconds.
Error Checker still receives the ORIGINAL unredacted response separately,
so this redaction does not affect confidentiality detection — it only
protects Review Agent's reasoning from being influenced by sensitive content.
"""

import re


# Patterns detect possible sensitive information.
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


def _is_sensitive_email(email: str, policy_context: str) -> bool:
    """
    Decide whether an email should be redacted.

    Public/support emails mentioned in policy context are preserved.
    Other emails are treated as potentially sensitive.
    """
    if email.lower() in policy_context.lower():
        return False

    return True


def _is_sensitive_phone(phone: str, policy_context: str) -> bool:
    """
    Decide whether a phone number should be redacted.

    A phone number explicitly mentioned in the policy context
    is treated as public/allowed.
    """
    digits = re.sub(r"\D", "", phone)

    policy_digits = re.sub(r"\D", "", policy_context)

    if digits and digits in policy_digits:
        return False

    return True


def redact(text: str, policy_context: str = "") -> str:
    """
    Context-aware redaction of potentially sensitive information.

    Public information explicitly present in the policy context
    is preserved. Other detected email, phone, and account-number
    patterns are redacted.
    """

    def replace_email(match):
        email = match.group(0)

        if _is_sensitive_email(email, policy_context):
            return "[REDACTED EMAIL]"

        return email

    def replace_phone(match):
        phone = match.group(0)

        if _is_sensitive_phone(phone, policy_context):
            return "[REDACTED PHONE]"

        return phone

    text = EMAIL_PATTERN.sub(replace_email, text)
    text = PHONE_PATTERN.sub(replace_phone, text)
    text = ACCOUNT_PATTERN.sub("[REDACTED ACCOUNT]", text)

    return text