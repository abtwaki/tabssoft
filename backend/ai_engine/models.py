from django.conf import settings
from django.db import models

from core.encryption import EncryptedTextField


class PromptTemplate(models.Model):
    """DB-editable prompt for a tool — lets staff tune assistants without
    a redeploy. If no active row exists for a tool key, the code default
    (ai_engine.tools) is used."""

    tool_key = models.CharField(max_length=60)
    name = models.CharField(max_length=120)
    system_prompt = models.TextField()
    user_template = models.TextField(
        help_text="Template rendered with {field_name} placeholders."
    )
    temperature = models.FloatField(default=0.7)
    max_tokens = models.PositiveIntegerField(default=0, help_text="0 = platform default")
    is_active = models.BooleanField(default=True)
    version = models.PositiveIntegerField(default=1)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="+",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["tool_key"]
        constraints = [
            models.UniqueConstraint(
                fields=["tool_key"], condition=models.Q(is_active=True),
                name="one_active_template_per_tool",
            )
        ]

    def __str__(self):
        return f"{self.tool_key} v{self.version}"


class UsageRecord(models.Model):
    """One row per AI generation — drives quotas and analytics."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="usage_records"
    )
    tool_key = models.CharField(max_length=60)
    input_tokens = models.PositiveIntegerField(default=0)
    output_tokens = models.PositiveIntegerField(default=0)
    model = models.CharField(max_length=80, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["tool_key", "created_at"]),
        ]

    def __str__(self):
        return f"{self.user.email} · {self.tool_key} · {self.created_at:%Y-%m-%d}"


class SavedDocument(models.Model):
    """User-saved output (CVs, letters, plans). Content encrypted at rest.

    `channel` is reserved for future delivery integrations — e.g. a real
    WhatsApp Business API send for the whatsapp_assistant tool on
    Pro/Business tiers — without restructuring this model."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="documents"
    )
    tool_key = models.CharField(max_length=60)
    title = models.CharField(max_length=200)
    content = EncryptedTextField()
    channel = models.CharField(max_length=30, default="web")
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.tool_key})"
