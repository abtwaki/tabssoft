from django.urls import path

from .views import (
    GenerateView,
    SavedDocumentDetailView,
    SavedDocumentListCreateView,
    ToolsView,
    UsageView,
)

urlpatterns = [
    path("tools/", ToolsView.as_view(), name="ai_tools"),
    path("generate/", GenerateView.as_view(), name="ai_generate"),
    path("usage/", UsageView.as_view(), name="ai_usage"),
    path("documents/", SavedDocumentListCreateView.as_view(), name="documents"),
    path("documents/<int:pk>/", SavedDocumentDetailView.as_view(), name="document_detail"),
]
