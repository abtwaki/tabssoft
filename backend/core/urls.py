from django.urls import path

from cms.views import PublicSiteContentView

from .views import ContactView, HealthView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("contact/", ContactView.as_view(), name="contact"),
    path("content/", PublicSiteContentView.as_view(), name="site_content"),
]
