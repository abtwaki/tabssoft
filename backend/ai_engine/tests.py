from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from ai_engine.models import UsageRecord
from ai_engine.providers import AIResult
from billing.models import Plan

User = get_user_model()


def make_user(email, role="student", plan="free"):
    user = User.objects.create_user(
        email=email, username=email, password="Passw0rd!2026", role=role,
    )
    from billing.services import activate_subscription
    activate_subscription(user, Plan.objects.get(slug=plan))
    return user


class AIToolsTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        Plan.objects.create(slug="free", name="Free", price_ngn=0, monthly_quota=20)
        Plan.objects.create(slug="pro", name="Pro", price_ngn=5000, monthly_quota=600)

    def auth(self, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(user).access_token}"
        )

    def test_tools_are_role_filtered(self):
        student = make_user("s@example.com", role="student")
        self.auth(student)
        res = self.client.get("/api/ai/tools/")
        keys = {t["key"] for t in res.data["tools"]}
        self.assertIn("email_assistant", keys)      # general
        self.assertIn("study_planner", keys)         # student
        self.assertNotIn("memo_writer", keys)        # civil servant only

    def test_role_tool_gating_on_generate(self):
        student = make_user("s2@example.com", role="student")
        self.auth(student)
        res = self.client.post(
            "/api/ai/generate/",
            {"tool": "memo_writer", "inputs": {"sender": "x", "recipient": "y", "subject": "z", "details": "d"}},
            format="json",
        )
        self.assertEqual(res.status_code, 403)

    def test_field_validation(self):
        student = make_user("s3@example.com", role="student")
        self.auth(student)
        res = self.client.post(
            "/api/ai/generate/",
            {"tool": "email_assistant", "inputs": {"tone": "bogus-option"}},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("field_errors", res.data)

    def test_quota_exhaustion_blocks_before_provider(self):
        user = make_user("s4@example.com", role="student")
        for _ in range(20):
            UsageRecord.objects.create(user=user, tool_key="email_assistant")
        self.auth(user)
        res = self.client.post(
            "/api/ai/generate/",
            {"tool": "email_assistant",
             "inputs": {"mode": "compose a new email", "tone": "friendly",
                        "recipient": "r", "purpose": "p", "points": "k"}},
            format="json",
        )
        self.assertEqual(res.status_code, 429)

    @patch("ai_engine.services.get_provider")
    def test_successful_generation_records_usage(self, mock_provider):
        provider = MagicMock()
        provider.generate.return_value = AIResult(
            text="Hello there", input_tokens=10, output_tokens=20, model="m"
        )
        mock_provider.return_value = provider
        user = make_user("s5@example.com", role="student")
        self.auth(user)
        res = self.client.post(
            "/api/ai/generate/",
            {"tool": "email_assistant",
             "inputs": {"mode": "compose a new email", "tone": "friendly",
                        "recipient": "r", "purpose": "p", "points": "k"}},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["output"], "Hello there")
        self.assertEqual(UsageRecord.objects.filter(user=user).count(), 1)
        self.assertEqual(res.data["quota"]["remaining"], 19)
