from django.urls import path

from .views import (
    BlogDetailView,
    BlogListCreateView,
    OverviewView,
    SiteContentDetailView,
    SiteContentListView,
    SubscriberDetailView,
    SubscriberListView,
    TemplateDetailView,
    TemplateListView,
    UsageAnalyticsView,
)

urlpatterns = [
    path("overview/", OverviewView.as_view(), name="admin_overview"),
    path("usage/", UsageAnalyticsView.as_view(), name="admin_usage"),
    path("subscribers/", SubscriberListView.as_view(), name="admin_subscribers"),
    path("subscribers/<int:pk>/", SubscriberDetailView.as_view(), name="admin_subscriber"),
    path("templates/", TemplateListView.as_view(), name="admin_templates"),
    path("templates/<str:tool_key>/", TemplateDetailView.as_view(), name="admin_template"),
    path("blog/", BlogListCreateView.as_view(), name="admin_blog_list"),
    path("blog/<int:pk>/", BlogDetailView.as_view(), name="admin_blog_detail"),
    path("content/", SiteContentListView.as_view(), name="admin_content"),
    path("content/<slug:key>/", SiteContentDetailView.as_view(), name="admin_content_detail"),
]
