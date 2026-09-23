from rest_framework import generics, permissions

from .models import BlogPost
from .serializers import BlogPostDetailSerializer, BlogPostListSerializer


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
