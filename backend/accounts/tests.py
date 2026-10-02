from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APITestCase

from billing.models import Plan

User = get_user_model()


class AuthFlowTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        Plan.objects.create(slug="free", name="Free", price_ngn=0, monthly_quota=20)

    def register(self, **overrides):
        payload = {
            "email": "new@example.com",
            "password": "Passw0rd!2026",
            "full_name": "New User",
            "role": "teacher",
            "consent": True,
        }
        payload.update(overrides)
        return self.client.post("/api/auth/register/", payload)

    def test_register_requires_consent(self):
        res = self.register(consent=False)
        self.assertEqual(res.status_code, 400)

    def test_register_returns_tokens_and_free_subscription(self):
        res = self.register()
        self.assertEqual(res.status_code, 201)
        self.assertIn("access", res.data["tokens"])
        self.assertEqual(res.data["user"]["role"], "teacher")
        # free subscription auto-provisioned
        user = User.objects.get(email="new@example.com")
        self.assertEqual(user.subscription.plan.slug, "free")

    def test_login_and_me(self):
        self.register()
        res = self.client.post(
            "/api/auth/login/",
            {"email": "new@example.com", "password": "Passw0rd!2026"},
        )
        self.assertEqual(res.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.data["email"], "new@example.com")

    def test_account_deletion_requires_password(self):
        res = self.register()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['tokens']['access']}")
        bad = self.client.delete("/api/auth/me/", {"password": "wrong"}, format="json")
        self.assertEqual(bad.status_code, 403)
        ok = self.client.delete("/api/auth/me/", {"password": "Passw0rd!2026"}, format="json")
        self.assertEqual(ok.status_code, 204)
        self.assertFalse(User.objects.filter(email="new@example.com").exists())

    def test_password_change(self):
        res = self.register()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['tokens']['access']}")
        bad = self.client.post(
            "/api/auth/password/change/",
            {"current_password": "nope", "new_password": "NewPass123!"},
        )
        self.assertEqual(bad.status_code, 400)
        ok = self.client.post(
            "/api/auth/password/change/",
            {"current_password": "Passw0rd!2026", "new_password": "NewPass123!"},
        )
        self.assertEqual(ok.status_code, 200)
        self.assertTrue(
            self.client.post(
                "/api/auth/login/",
                {"email": "new@example.com", "password": "NewPass123!"},
            ).status_code == 200
        )

    def test_forgot_password_never_leaks_and_reset_works(self):
        self.register()
        res = self.client.post("/api/auth/password/forgot/", {"email": "new@example.com"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        # unknown email → same response, no mail
        res2 = self.client.post("/api/auth/password/forgot/", {"email": "ghost@example.com"})
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

        user = User.objects.get(email="new@example.com")
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        ok = self.client.post(
            "/api/auth/password/reset/",
            {"uid": uid, "token": token, "new_password": "ResetPass9!"},
        )
        self.assertEqual(ok.status_code, 200)
        # token is single-use
        again = self.client.post(
            "/api/auth/password/reset/",
            {"uid": uid, "token": token, "new_password": "OtherPass1!"},
        )
        self.assertEqual(again.status_code, 400)

    def test_logout_blacklists_refresh_token(self):
        res = self.register()
        refresh = res.data["tokens"]["refresh"]
        # logout works without an access token (it may have expired)
        out = self.client.post("/api/auth/logout/", {"refresh": refresh}, format="json")
        self.assertEqual(out.status_code, 204)
        reused = self.client.post("/api/auth/refresh/", {"refresh": refresh})
        self.assertEqual(reused.status_code, 401)
