from rest_framework import serializers

from .models import PaymentTransaction, Plan, Subscription


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = (
            "slug",
            "name",
            "price_ngn",
            "monthly_quota",
            "description",
            "features",
            "sort_order",
        )


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = (
            "plan",
            "status",
            "current_period_start",
            "current_period_end",
            "cancel_at_period_end",
        )


class TransactionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source="plan.name", read_only=True, default="")

    class Meta:
        model = PaymentTransaction
        fields = (
            "reference",
            "plan_name",
            "amount_ngn",
            "status",
            "channel",
            "paid_at",
            "created_at",
        )
