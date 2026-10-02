from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BlogPost, SiteContent
from .serializers import (
    BlogPostDetailSerializer,
    BlogPostListSerializer,
    SiteContentSerializer,
)


class PublicPostListView(generics.ListAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = BlogPostListSerializer

    def get_queryset(self):
        return BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED)


class PublicPostDetailView(generics.RetrieveAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = BlogPostDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return BlogPost.objects.filter(status=BlogPost.Status.PUBLISHED)


class PublicSiteContentView(APIView):
    """Public read access to CMS-managed site content blocks, keyed dict:
    GET /api/content/ → {"services_tabsforge": {"title": ..., "content": ...}}"""

    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        data = {
            item.key: SiteContentSerializer(item).data
            for item in SiteContent.objects.all()
        }
        return Response(data)
