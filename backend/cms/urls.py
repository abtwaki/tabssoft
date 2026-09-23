from django.urls import path

from .views import PublicPostDetailView, PublicPostListView

urlpatterns = [
    path("posts/", PublicPostListView.as_view(), name="blog_list"),
    path("posts/<slug:slug>/", PublicPostDetailView.as_view(), name="blog_detail"),
]
