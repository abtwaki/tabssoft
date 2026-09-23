import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from .models import SavedDocument
from .providers import AIConfigError, AIProviderError
from .serializers import SavedDocumentSerializer
from .services import (
    QuotaExceeded,
    generate,
    quota_for,
    usage_summary,
)
from .tools import WORKSPACES, get_tool, tools_for_role

logger = logging.getLogger(__name__)


class AIGenerateThrottle(SimpleRateThrottle):
    scope = "ai_generate"

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return f"ai:{request.user.pk}"
        return self.get_ident(request)


class ToolsView(APIView):
    """Tools available to the current user (general + their role's tools),
    each with its input schema for dynamic form rendering."""

    def get(self, request):
        user = request.user
        tools = tools_for_role(user.role)
        workspace_roles = {"general"} | {
            w["role"] for w in WORKSPACES if w["role"] == user.role
        }
        payload = []
        for t in tools:
            payload.append(
                {
                    "key": t["key"],
                    "name": t["name"],
                    "category": t["category"],
                    "icon": t["icon"],
                    "description": t["description"],
                    "fields": t["fields"],
                    "integrity_notice": t.get("integrity_notice"),
                    "future_note": t.get("future_note"),
                }
            )
        return Response(
            {
                "tools": payload,
                "workspaces": [
                    w for w in WORKSPACES if w["role"] in ("general", user.role)
                ],
                "quota": quota_for(user),
            }
        )


class GenerateView(APIView):
    throttle_classes = (AIGenerateThrottle,)

    def post(self, request):
        tool_key = request.data.get("tool", "")
        inputs = request.data.get("inputs", {})

        if get_tool(tool_key) is None:
            return Response({"detail": "Unknown tool."}, status=status.HTTP_404_NOT_FOUND)

        try:
            result = generate(request.user, tool_key, inputs)
        except PermissionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except QuotaExceeded as exc:
            return Response(
                {
                    "detail": "Monthly quota reached. Upgrade your plan to continue.",
                    "quota": {"used": exc.used, "limit": exc.limit},
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc), "field_errors": getattr(exc, "field_errors", {})},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except AIConfigError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except AIProviderError as exc:
            logger.warning("AI provider error: %s", exc)
            return Response(
                {"detail": "The AI service had a problem. Please try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response(result)


class UsageView(APIView):
    def get(self, request):
        return Response(usage_summary(request.user))


class SavedDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedDocumentSerializer

    def get_queryset(self):
        qs = SavedDocument.objects.filter(user=self.request.user)
        tool = self.request.query_params.get("tool")
        if tool:
            qs = qs.filter(tool_key=tool)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavedDocumentSerializer

    def get_queryset(self):
        return SavedDocument.objects.filter(user=self.request.user)
