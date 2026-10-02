"""Generation orchestration: template resolution, input validation,
quota enforcement, provider call, usage logging."""

import re
import string
from datetime import datetime

from django.conf import settings
from django.db.models import Count, Sum
from django.utils import timezone

from billing.services import effective_plan, get_or_create_subscription

from .models import PromptTemplate, UsageRecord
from .providers import get_provider
from .tools import TOOLS_BY_KEY, get_tool


class QuotaExceeded(Exception):
    def __init__(self, used, limit):
        self.used = used
        self.limit = limit
        super().__init__("Monthly AI generation quota reached.")


def month_start():
    now = timezone.now()
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def usage_this_month(user):
    return UsageRecord.objects.filter(user=user, created_at__gte=month_start()).count()


def quota_for(user):
    sub = get_or_create_subscription(user)
    plan = effective_plan(user)
    limit = plan.monthly_quota if plan else 0
    used = usage_this_month(user)
    return {"limit": limit, "used": used, "remaining": max(0, limit - used),
            "plan": plan.slug if plan else "none",
            "active": bool(sub and sub.is_active()),
            "expired": bool(sub and sub.is_expired()),
            "subscribed_plan": sub.plan.slug if sub else "none"}


def check_quota(user):
    q = quota_for(user)
    if q["remaining"] <= 0:
        raise QuotaExceeded(q["used"], q["limit"])
    return q


def resolve_template(tool):
    tpl = (
        PromptTemplate.objects.filter(tool_key=tool["key"], is_active=True)
        .order_by("-version")
        .first()
    )
    if tpl:
        return tpl.system_prompt, tpl.user_template, tpl.max_tokens or None
    return tool["system"], tool["template"], None


def validate_inputs(tool, inputs):
    """Returns cleaned {name: value} for declared fields only."""
    if not isinstance(inputs, dict):
        raise ValueError("inputs must be an object")

    cleaned = {}
    errors = {}
    declared = {f["name"]: f for f in tool["fields"]}

    for name, field in declared.items():
        raw = inputs.get(name, "")
        if raw is None:
            raw = ""
        if not isinstance(raw, (str, int, float)):
            errors[name] = "Invalid value."
            continue
        value = str(raw).strip()
        # Neutralize control chars; keep newlines/tabs.
        value = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)
        if field.get("required") and not value:
            errors[name] = "This field is required."
            continue
        if value and len(value) > settings.AI_MAX_INPUT_CHARS:
            errors[name] = f"Too long (max {settings.AI_MAX_INPUT_CHARS} chars)."
            continue
        if field.get("type") == "select" and value:
            if value not in field.get("options", []):
                errors[name] = "Invalid option."
                continue
        cleaned[name] = value

    total = sum(len(v) for v in cleaned.values())
    if total > settings.AI_MAX_INPUT_CHARS * 3:
        errors["_all"] = "Total input too large."

    if errors:
        exc = ValueError("Invalid inputs")
        exc.field_errors = errors
        raise exc
    return cleaned


def render_user_prompt(template_str, values):
    formatter = string.Formatter()

    class SafeDict(dict):
        def __missing__(self, key):
            return ""

    try:
        return formatter.vformat(template_str, (), SafeDict(values))
    except (KeyError, IndexError, ValueError):
        return template_str


def generate(user, tool_key, inputs):
    tool = get_tool(tool_key)
    if tool is None:
        raise KeyError(f"Unknown tool '{tool_key}'")
    if tool["category"] == "role" and user.role not in tool.get("roles", []):
        raise PermissionError("This tool isn't available for your role.")

    cleaned = validate_inputs(tool, inputs)
    quota = check_quota(user)

    system_prompt, user_template, max_tokens = resolve_template(tool)
    user_prompt = render_user_prompt(user_template, cleaned)

    provider = get_provider()
    result = provider.generate(system_prompt, user_prompt, max_tokens=max_tokens)

    UsageRecord.objects.create(
        user=user,
        tool_key=tool_key,
        input_tokens=result.input_tokens,
        output_tokens=result.output_tokens,
        model=result.model,
    )
    quota["used"] += 1
    quota["remaining"] = max(0, quota["limit"] - quota["used"])

    return {"output": result.text, "quota": quota, "model": result.model}


def usage_summary(user):
    start = month_start()
    rows = (
        UsageRecord.objects.filter(user=user, created_at__gte=start)
        .values("tool_key")
        .annotate(count=Count("id"), tokens=Sum("output_tokens"))
        .order_by("-count")
    )
    by_tool = {r["tool_key"]: {"count": r["count"], "tokens": r["tokens"] or 0}
               for r in rows}
    for r in rows:
        if r["tool_key"] in TOOLS_BY_KEY:
            by_tool[r["tool_key"]]["name"] = TOOLS_BY_KEY[r["tool_key"]]["name"]
    return {
        "month": start.strftime("%B %Y"),
        "quota": quota_for(user),
        "by_tool": by_tool,
    }
