from rest_framework import serializers

from .models import BlogPost, SiteContent


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.full_name", read_only=True, default="TabsSoft Team"
    )

    class Meta:
        model = BlogPost
        fields = ("id", "title", "slug", "excerpt", "cover_image_url",
                  "author_name", "published_at")


class BlogPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.full_name", read_only=True, default="TabsSoft Team"
    )

    class Meta:
        model = BlogPost
        fields = ("id", "title", "slug", "excerpt", "content",
                  "cover_image_url", "status", "author_name",
                  "published_at", "created_at", "updated_at")
        read_only_fields = ("slug", "published_at", "created_at", "updated_at")


class SiteContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContent
        fields = ("key", "title", "content", "updated_at")
        read_only_fields = ("updated_at",)
