import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import connection
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from .serializers import ContactMessageSerializer

logger = logging.getLogger(__name__)


class ContactThrottle(SimpleRateThrottle):
    scope = "contact"

    def get_cache_key(self, request, view):
        return self.get_ident(request)


class HealthView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = ()

    def get(self, request):
        db_ok = True
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_ok = False

        provider = settings.AI_PROVIDER
        key_set = bool(
            settings.ANTHROPIC_API_KEY if provider == "anthropic" else settings.OPENAI_API_KEY
        )
        payload = {
            "status": "ok" if db_ok else "degraded",
            "db": "up" if db_ok else "down",
            "ai_provider": provider,
            "ai_configured": key_set,
        }
        return Response(payload, status=status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE)


class ContactView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (ContactThrottle,)

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        msg = serializer.save()
        try:
            send_mail(
                subject=f"[TabsSoft Contact] {msg.subject}",
                message=f"From: {msg.name} <{msg.email}>\n\n{msg.message}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_EMAIL],
                fail_silently=True,
            )
        except Exception:
            logger.exception("Failed to send contact notification email")
        return Response({"detail": "Message received. We'll be in touch shortly."}, status=status.HTTP_201_CREATED)
