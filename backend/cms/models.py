from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class BlogPost(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    excerpt = models.CharField(max_length=300, blank=True)
    content = models.TextField(help_text="HTML content from the WYSIWYG editor")
    cover_image_url = models.URLField(blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="blog_posts",
    )
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title)[:200] or "post"
            slug, i = base, 2
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{i}"
                i += 1
            self.slug = slug
        if self.status == self.Status.PUBLISHED and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class SiteContent(models.Model):
    """Keyed editable content blocks for the public site — service
    descriptions, hero copy, etc. Editable by staff without a redeploy."""

    key = models.SlugField(max_length=80, unique=True)
    title = models.CharField(max_length=150)
    content = models.TextField(help_text="HTML content")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}"
