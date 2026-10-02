from datetime import timedelta

from django.utils import timezone

from .models import Plan, Subscription


def free_plan():
    return Plan.objects.filter(price_ngn=0, is_active=True).order_by("sort_order").first()


def effective_plan(user):
    """The plan that currently governs this user's quota. An expired or
    cancelled paid subscription gracefully degrades to the free tier."""
    sub = get_or_create_subscription(user)
    if sub and sub.is_active():
        return sub.plan
    return free_plan() or (sub.plan if sub else None)


def get_or_create_subscription(user):
    """Every user always has a subscription — defaults to the free plan."""
    sub = getattr(user, "subscription", None)
    if sub:
        return sub
    free = free_plan() or Plan.objects.filter(is_active=True).order_by("price_ngn").first()
    if free is None:
        return None
    return Subscription.objects.create(
        user=user, plan=free, status=Subscription.Status.ACTIVE,
        current_period_end=None if free.price_ngn == 0 else timezone.now() + timedelta(days=30),
    )


def activate_subscription(user, plan, period_days=30, paystack_customer_code="",
                          paystack_subscription_code="", paystack_email_token=""):
    sub = get_or_create_subscription(user)
    now = timezone.now()
    if sub is None:
        sub = Subscription(user=user)
    sub.plan = plan
    sub.status = Subscription.Status.ACTIVE
    sub.current_period_start = now
    sub.current_period_end = None if plan.price_ngn == 0 else now + timedelta(days=period_days)
    sub.cancel_at_period_end = False
    if paystack_customer_code:
        sub.paystack_customer_code = paystack_customer_code
    if paystack_subscription_code:
        sub.paystack_subscription_code = paystack_subscription_code
    if paystack_email_token:
        sub.paystack_email_token = paystack_email_token
    sub.save()
    return sub
