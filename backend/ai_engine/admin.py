from django.contrib import admin

from .models import PromptTemplate, SavedDocument, UsageRecord


@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    list_display = ("tool_key", "name", "version", "is_active", "updated_at")
    list_filter = ("is_active", "tool_key")
    search_fields = ("tool_key", "name")


@admin.register(UsageRecord)
class UsageRecordAdmin(admin.ModelAdmin):
    list_display = ("user", "tool_key", "input_tokens", "output_tokens", "created_at")
    list_filter = ("tool_key", "created_at")
    search_fields = ("user__email",)


@admin.register(SavedDocument)
class SavedDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "tool_key", "updated_at")
    list_filter = ("tool_key",)
    search_fields = ("title", "user__email")
    readonly_fields = ("content",)
