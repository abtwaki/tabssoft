from rest_framework import serializers

from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "subject", "message")

    def validate_message(self, value):
        if len(value) > 8000:
            raise serializers.ValidationError("Message is too long (max 8000 chars).")
        return value
