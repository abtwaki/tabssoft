from django.contrib import admin

from .models import BlogPost, SiteContent


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "author", "published_at")
    list_filter = ("status", "published_at")
    search_fields = ("title", "excerpt")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ("key", "title", "updated_at")
    search_fields = ("key", "title")
