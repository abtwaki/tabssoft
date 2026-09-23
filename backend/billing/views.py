import json
import logging
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from . import paystack
from .models import PaymentTransaction, Plan
from .serializers import PlanSerializer, SubscriptionSerializer, TransactionSerializer
from .services import activate_subscription, get_or_create_subscription

logger = logging.getLogger(__name__)


class PlanListView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        plans = Plan.objects.filter(is_active=True)
        return Response(PlanSerializer(plans, many=True).data)


class SubscriptionView(APIView):
    def get(self, request):
        sub = get_or_create_subscription(request.user)
        if sub is None:
            return Response({"detail": "No plans configured."}, status=503)
        return Response(SubscriptionSerializer(sub).data)


class TransactionListView(APIView):
    def get(self, request):
        txns = PaymentTransaction.objects.filter(user=request.user)[:50]
        return Response(TransactionSerializer(txns, many=True).data)


class InitializeView(APIView):
    """Start a Paystack checkout for the given plan. Returns authorization_url."""

    def post(self, request):
        plan_slug = request.data.get("plan")
        plan = Plan.objects.filter(slug=plan_slug, is_active=True).first()
        if plan is None:
            return Response({"detail": "Unknown plan."}, status=status.HTTP_404_NOT_FOUND)

        if plan.price_ngn == 0:
            activate_subscription(request.user, plan)
            return Response({"free": True, "detail": f"You're on {plan.name}."})

        try:
            callback_url = f"{settings.FRONTEND_URL}/app/billing/callback"
            data = paystack.initialize_transaction(
                email=request.user.email,
                amount_ngn=plan.price_ngn,
                callback_url=callback_url,
                metadata={"plan_slug": plan.slug, "user_id": request.user.id},
            )
        except paystack.PaystackError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        PaymentTransaction.objects.create(
            user=request.user,
            plan=plan,
            reference=data["reference"],
            amount_ngn=plan.price_ngn,
        )
        return Response(
            {
                "authorization_url": data["authorization_url"],
                "access_code": data.get("access_code", ""),
                "reference": data["reference"],
            }
        )


class VerifyView(APIView):
    """Called by the frontend after Paystack redirects back."""

    def get(self, request, reference):
        txn = PaymentTransaction.objects.filter(
            reference=reference, user=request.user
        ).first()
        if txn is None:
            return Response({"detail": "Unknown reference."}, status=status.HTTP_404_NOT_FOUND)
        if txn.status == PaymentTransaction.Status.SUCCESS:
            return Response({"status": "success", "already_processed": True})

        try:
            data = paystack.verify_transaction(reference)
        except paystack.PaystackError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        if data.get("status") == "success":
            self._mark_success(txn, data)
            return Response({"status": "success"})
        txn.status = PaymentTransaction.Status.FAILED
        txn.raw_response = data
        txn.save(update_fields=["status", "raw_response"])
        return Response({"status": "failed"}, status=status.HTTP_402_PAYMENT_REQUIRED)

    @staticmethod
    def _mark_success(txn, data):
        txn.status = PaymentTransaction.Status.SUCCESS
        txn.channel = data.get("channel", "")
        txn.paid_at = timezone.now()
        txn.raw_response = data
        txn.save()
        customer = data.get("customer") or {}
        activate_subscription(
            txn.user,
            txn.plan,
            paystack_customer_code=str(customer.get("customer_code", "")),
        )


class CancelView(APIView):
    def post(self, request):
        sub = get_or_create_subscription(request.user)
        if sub is None or not sub.is_active():
            return Response({"detail": "No active subscription."}, status=400)

        if sub.paystack_subscription_code and sub.paystack_email_token:
            try:
                paystack.cancel_subscription(
                    sub.paystack_subscription_code, sub.paystack_email_token
                )
            except paystack.PaystackError as exc:
                logger.warning("Paystack cancel failed: %s", exc)

        sub.cancel_at_period_end = True
        sub.save(update_fields=["cancel_at_period_end", "updated_at"])
        return Response(SubscriptionSerializer(sub).data)


class WebhookView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    @csrf_exempt
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        signature = request.headers.get("X-Paystack-Signature", "")
        if not paystack.verify_webhook_signature(request.body, signature):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        try:
            event = json.loads(request.body)
        except json.JSONDecodeError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        event_name = event.get("event")
        data = event.get("data", {})

        if event_name == "charge.success":
            reference = data.get("reference")
            txn = PaymentTransaction.objects.filter(reference=reference).first()
            if txn and txn.status != PaymentTransaction.Status.SUCCESS:
                VerifyView._mark_success(txn, data)
        elif event_name in ("subscription.disable", "subscription.not_renew"):
            code = data.get("subscription_code") or data.get("code", "")
            from .models import Subscription

            Subscription.objects.filter(paystack_subscription_code=code).update(
                cancel_at_period_end=True
            )

        return Response(status=status.HTTP_200_OK)
