from django.urls import path

from .views import ContactView, HealthView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("contact/", ContactView.as_view(), name="contact"),
]
