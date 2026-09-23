from django.urls import path

from .views import (
    CancelView,
    InitializeView,
    PlanListView,
    SubscriptionView,
    TransactionListView,
    VerifyView,
    WebhookView,
)

urlpatterns = [
    path("plans/", PlanListView.as_view(), name="plans"),
    path("subscription/", SubscriptionView.as_view(), name="subscription"),
    path("transactions/", TransactionListView.as_view(), name="transactions"),
    path("initialize/", InitializeView.as_view(), name="initialize"),
    path("verify/<str:reference>/", VerifyView.as_view(), name="verify"),
    path("cancel/", CancelView.as_view(), name="cancel"),
    path("webhook/paystack/", WebhookView.as_view(), name="paystack_webhook"),
]
