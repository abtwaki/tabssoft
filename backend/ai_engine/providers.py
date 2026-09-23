"""AI provider abstraction.

A single engine powers every workspace — the provider is swappable via
AI_PROVIDER ("anthropic" or "openai"). Both adapters expose the same
generate() surface and return a normalized AIResult.
"""

from dataclasses import dataclass

from django.conf import settings


class AIConfigError(Exception):
    """Raised when no provider is configured."""


class AIProviderError(Exception):
    """Raised when the upstream provider call fails."""


@dataclass
class AIResult:
    text: str
    input_tokens: int = 0
    output_tokens: int = 0
    model: str = ""


class AnthropicProvider:
    name = "anthropic"

    def __init__(self):
        if not settings.ANTHROPIC_API_KEY:
            raise AIConfigError("ANTHROPIC_API_KEY is not configured.")
        import anthropic

        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ANTHROPIC_MODEL

    def generate(self, system_prompt, user_prompt, max_tokens=None):
        try:
            resp = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens or settings.AI_MAX_OUTPUT_TOKENS,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
        except Exception as exc:
            raise AIProviderError(str(exc)) from exc
        text = "".join(
            block.text for block in resp.content if getattr(block, "type", "") == "text"
        )
        return AIResult(
            text=text.strip(),
            input_tokens=getattr(resp.usage, "input_tokens", 0),
            output_tokens=getattr(resp.usage, "output_tokens", 0),
            model=self.model,
        )


class OpenAIProvider:
    name = "openai"

    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise AIConfigError("OPENAI_API_KEY is not configured.")
        import openai

        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def generate(self, system_prompt, user_prompt, max_tokens=None):
        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens or settings.AI_MAX_OUTPUT_TOKENS,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
        except Exception as exc:
            raise AIProviderError(str(exc)) from exc
        choice = resp.choices[0]
        return AIResult(
            text=(choice.message.content or "").strip(),
            input_tokens=getattr(resp.usage, "prompt_tokens", 0),
            output_tokens=getattr(resp.usage, "completion_tokens", 0),
            model=self.model,
        )


_PROVIDERS = {"anthropic": AnthropicProvider, "openai": OpenAIProvider}


def get_provider():
    cls = _PROVIDERS.get(settings.AI_PROVIDER)
    if cls is None:
        raise AIConfigError(f"Unknown AI_PROVIDER '{settings.AI_PROVIDER}'.")
    return cls()


def provider_configured():
    try:
        get_provider()
        return True
    except AIConfigError:
        return False
