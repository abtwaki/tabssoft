from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/billing/", include("billing.urls")),
    path("api/ai/", include("ai_engine.urls")),
    path("api/blog/", include("cms.urls")),
    path("api/admin/", include("staffadmin.urls")),
    path("api/", include("core.urls")),
]
