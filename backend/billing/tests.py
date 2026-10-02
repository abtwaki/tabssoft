from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from ai_engine.services import quota_for
from billing.models import Plan, Subscription
from billing.services import activate_subscription, effective_plan

User = get_user_model()


class SubscriptionLifecycleTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.free = Plan.objects.create(slug="free", name="Free", price_ngn=0, monthly_quota=20)
        cls.pro = Plan.objects.create(slug="pro", name="Pro", price_ngn=5000, monthly_quota=600)

    def test_plans_list_is_public(self):
        res = self.client.get("/api/billing/plans/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 2)

    def test_free_plan_never_expires(self):
        user = User.objects.create_user(email="f@example.com", username="f@example.com")
        activate_subscription(user, self.free)
        sub = user.subscription
        sub.current_period_end = timezone.now() - timedelta(days=1)
        sub.save()
        self.assertTrue(sub.is_active())
        self.assertEqual(effective_plan(user).slug, "free")

    def test_expired_paid_plan_degrades_to_free_quota(self):
        user = User.objects.create_user(email="p@example.com", username="p@example.com")
        activate_subscription(user, self.pro)
        # period ended yesterday → expired
        Subscription.objects.filter(user=user).update(
            current_period_end=timezone.now() - timedelta(days=1)
        )
        self.assertFalse(Subscription.objects.get(user=user).is_active())
        self.assertTrue(Subscription.objects.get(user=user).is_expired())
        # fresh instance (as a real request would build from JWT auth)
        fresh = User.objects.get(pk=user.pk)
        self.assertEqual(effective_plan(fresh).slug, "free")
        q = quota_for(fresh)
        self.assertEqual(q["limit"], 20)
        self.assertEqual(q["plan"], "free")
        self.assertTrue(q["expired"])
        self.assertEqual(q["subscribed_plan"], "pro")

    def test_active_paid_plan_uses_own_quota(self):
        user = User.objects.create_user(email="a@example.com", username="a@example.com")
        activate_subscription(user, self.pro)
        q = quota_for(user)
        self.assertEqual(q["limit"], 600)
        self.assertFalse(q["expired"])

    def test_cancel_sets_flag(self):
        user = User.objects.create_user(email="c@example.com", username="c@example.com")
        activate_subscription(user, self.pro)
        from rest_framework_simplejwt.tokens import RefreshToken
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}"
        )
        res = self.client.post("/api/billing/cancel/")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data["cancel_at_period_end"])


from cryptography.fernet import Fernet
from django.test import override_settings

TEST_FERNET_KEY = Fernet.generate_key().decode()


class ContactTests(APITestCase):
    def test_health(self):
        res = self.client.get("/api/health/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["db"], "up")

    @override_settings(FIELD_ENCRYPTION_KEY=TEST_FERNET_KEY)
    def test_contact_post(self):
        from core.models import ContactMessage
        res = self.client.post(
            "/api/contact/",
            {"name": "Test", "email": "t@example.com", "subject": "Hi", "message": "Hello"},
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)
