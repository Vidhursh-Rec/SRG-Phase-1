import os
from typing import Protocol

from dotenv import load_dotenv
from groq import Groq
import httpx
load_dotenv()


class LLMClient(Protocol):
    def generate(self, prompt: str, max_tokens: int = 300) -> str:
        ...


class GroqLLMClient:
    """Real LLM client using Groq API."""

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("GROQ_API_KEY not found in .env")

        self.client = Groq(api_key=api_key)

    def generate(self, prompt: str, max_tokens: int = 500) -> str:
        response = self.client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
            max_tokens=max_tokens,
            reasoning_effort="low"
        )

        content = response.choices[0].message.content
        print("\n--- GROQ DEBUG ---")
        print("Content:", repr(content))
        print("Finish reason:", response.choices[0].finish_reason)
        print("------------------\n")
        return content or ""


class MockLLMClient:
    """Temporary offline LLM for testing."""

    def generate(self, prompt: str, max_tokens: int = 300) -> str:
        lowered = prompt.lower()

        if "policy and tone compliance checker" in lowered:
            return (
                '{"passed": true, '
                '"reason": "Mock: policy and tone check passed."}'
            )

        if "factual accuracy and confidentiality checker" in lowered:
            return (
                '{"passed": true, '
                '"reason": "Mock: no confidential data or factual errors found."}'
            )

        return "This is a mock rewritten response."
