from rest_framework import serializers

from .models import PromptTemplate, SavedDocument


class SavedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedDocument
        fields = ("id", "tool_key", "title", "content", "channel", "meta",
                  "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at")

    def validate_content(self, value):
        if len(value) > 60000:
            raise serializers.ValidationError("Document too large (max 60k chars).")
        return value


class PromptTemplateSerializer(serializers.ModelSerializer):
    tool_name = serializers.SerializerMethodField()

    class Meta:
        model = PromptTemplate
        fields = ("id", "tool_key", "tool_name", "name", "system_prompt",
                  "user_template", "temperature", "max_tokens", "is_active",
                  "version", "updated_at")
        read_only_fields = ("version", "updated_at")

    def get_tool_name(self, obj):
        from .tools import TOOLS_BY_KEY
        t = TOOLS_BY_KEY.get(obj.tool_key)
        return t["name"] if t else obj.tool_key
