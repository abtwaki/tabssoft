from django.conf import settings
from django.db import models
from django.utils import timezone


class Plan(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=60)
    price_ngn = models.PositiveIntegerField(help_text="Monthly price in Naira")
    monthly_quota = models.PositiveIntegerField(
        help_text="AI generations per calendar month"
    )
    description = models.CharField(max_length=300, blank=True)
    features = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    paystack_plan_code = models.CharField(
        max_length=60, blank=True, help_text="Optional Paystack plan code for recurring billing"
    )

    class Meta:
        ordering = ["sort_order", "price_ngn"]

    def __str__(self):
        return f"{self.name} (₦{self.price_ngn:,}/mo)"


class Subscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        TRIALING = "trialing", "Trialing"
        PAST_DUE = "past_due", "Past due"
        CANCELLED = "cancelled", "Cancelled"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscription"
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="subscriptions")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    current_period_start = models.DateTimeField(default=timezone.now)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    paystack_customer_code = models.CharField(max_length=80, blank=True)
    paystack_subscription_code = models.CharField(max_length=80, blank=True)
    paystack_email_token = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_active(self):
        return self.status in (self.Status.ACTIVE, self.Status.TRIALING)

    def __str__(self):
        return f"{self.user.email} → {self.plan.slug} ({self.status})"


class PaymentTransaction(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"
        ABANDONED = "abandoned", "Abandoned"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions"
    )
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    reference = models.CharField(max_length=80, unique=True)
    amount_ngn = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    channel = models.CharField(max_length=40, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} ({self.status})"
