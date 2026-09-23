"""Seed plans, demo users, blog posts, and site content.

Usage: python manage.py seed_demo
Idempotent — safe to run repeatedly.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from ai_engine.models import PromptTemplate
from ai_engine.tools import TOOL_DEFINITIONS
from billing.models import Plan
from billing.services import activate_subscription, get_or_create_subscription
from cms.models import BlogPost, SiteContent

User = get_user_model()

PLANS = [
    {
        "slug": "free",
        "name": "Free Trial",
        "price_ngn": 0,
        "monthly_quota": 20,
        "description": "Try the suite — 20 AI generations a month, every general tool.",
        "features": ["20 AI generations/month", "All general tools", "1 workspace", "Email support"],
        "sort_order": 0,
    },
    {
        "slug": "basic",
        "name": "Basic",
        "price_ngn": 2500,
        "monthly_quota": 150,
        "description": "For individuals who need the core tools every week.",
        "features": ["150 AI generations/month", "All general tools", "Your role workspace", "Saved documents", "Email support"],
        "sort_order": 1,
    },
    {
        "slug": "pro",
        "name": "Pro",
        "price_ngn": 5000,
        "monthly_quota": 600,
        "description": "Heavy daily use, priority responses, all workspaces.",
        "features": ["600 AI generations/month", "All tools & workspaces", "Priority queue", "Saved documents", "Priority support"],
        "sort_order": 2,
    },
    {
        "slug": "business",
        "name": "Business",
        "price_ngn": 15000,
        "monthly_quota": 3000,
        "description": "Teams and power users — highest quotas, future WhatsApp API access.",
        "features": ["3,000 AI generations/month", "Everything in Pro", "Team seats (soon)", "WhatsApp API early access", "Dedicated support"],
        "sort_order": 3,
    },
]

DEMO_USERS = [
    # email, name, role, plan, staff
    ("admin@tabssoftglobal.com", "TabsSoft Admin", "general", "business", True),
    ("civil@demo.tabssoft.ng", "Amina Ibrahim", "civil_servant", "pro", False),
    ("teacher@demo.tabssoft.ng", "Chukwuemeka Obi", "teacher", "basic", False),
    ("student@demo.tabssoft.ng", "Fatima Musa", "student", "free", False),
    ("business@demo.tabssoft.ng", "Oluwaseun Adeyemi", "business_owner", "business", False),
    ("pastor@demo.tabssoft.ng", "Rev. Danjuma Gana", "gospel_minister", "basic", False),
    ("lecturer@demo.tabssoft.ng", "Dr. Ngozi Eze", "lecturer", "pro", False),
]

BLOG_POSTS = [
    {
        "title": "Introducing TabsSoft AI Suite: World-Class AI Tools for Nigerian Professionals",
        "excerpt": "Today we launch a subscription platform that puts role-tuned AI assistants — built for Nigerian contexts — in the hands of civil servants, teachers, students, and business owners.",
        "content": """<p>We're proud to launch <strong>TabsSoft AI Suite</strong> — a subscription platform that gives Nigerian professionals access to AI assistants tuned for the work they actually do.</p><h2>Built for how Nigeria works</h2><p>Generic AI tools don't understand a civil-service memo format, a NERDC-aligned lesson plan, or a ₦-denominated business quotation. Ours do. Every workspace — Civil Servants, Teachers, Students, Business Owners, Ministers, and Lecturers — is powered by prompts engineered for Nigerian conventions.</p><h2>What's inside</h2><ul><li>Email &amp; WhatsApp assistants</li><li>CV builder with civil-service, academic, corporate and entry-level formats</li><li>Role-specific workspaces with tuned tools</li></ul><p>Sign up for the free tier and see the difference a purpose-built tool makes.</p>""",
    },
    {
        "title": "From TabsForge SchoolOS to a National AI Platform",
        "excerpt": "How our experience building school management software for Nigerian institutions shaped the AI Suite.",
        "content": """<p>TabsSoft's team has spent years inside Nigerian institutions — building TabsForge SchoolOS, delivering ADAPTI digital-literacy training for tertiary institutions, and running enterprise infrastructure at FUTMinna.</p><p>That experience taught us something important: the gap isn't access to technology — it's access to technology that <em>understands the context</em>. The AI Suite is our answer.</p>""",
    },
    {
        "title": "5 Ways Civil Servants Can Use AI Responsibly",
        "excerpt": "Memo drafting, circular summarization and more — practical, policy-safe uses of AI in the civil service.",
        "content": """<p>AI in government isn't about replacing judgement — it's about removing drudgery. Here are five responsible starting points:</p><ol><li>Draft memos faster, then apply your judgement</li><li>Summarize long circulars into action items</li><li>Prepare promotion documentation</li><li>Draft routine correspondence</li><li>Prepare briefing notes</li></ol><p>Always review AI output before sending — it assists, you decide.</p>""",
    },
]

SITE_CONTENT = [
    {
        "key": "services_software",
        "title": "Software Development",
        "content": "Custom web platforms, portals, and internal systems engineered to global standards — from discovery through deployment and long-term support.",
    },
    {
        "key": "services_tabsforge",
        "title": "TabsForge SchoolOS",
        "content": "A complete school operating system: admissions, academics, finance, communications and reporting — built for Nigerian schools and colleges.",
    },
    {
        "key": "services_consulting",
        "title": "IT Consulting & Training",
        "content": "Digital-transformation consulting and capacity-building programmes, including ADAPTI-style digital appreciation training for tertiary institutions.",
    },
    {
        "key": "services_ai",
        "title": "AI Solutions",
        "content": "Applied AI for institutions and businesses: workflow automation, custom assistants, and the TabsSoft AI Suite subscription platform.",
    },
]


class Command(BaseCommand):
    help = "Seed plans, demo users, blog posts and site content (idempotent)."

    def handle(self, *args, **options):
        self.seed_plans()
        self.seed_users()
        self.seed_templates()
        self.seed_blog()
        self.seed_site_content()
        self.stdout.write(self.style.SUCCESS("Seed complete."))

    def seed_plans(self):
        for p in PLANS:
            Plan.objects.update_or_create(slug=p["slug"], defaults=p)
        self.stdout.write(f"  plans: {Plan.objects.count()}")

    def seed_users(self):
        for email, name, role, plan_slug, staff in DEMO_USERS:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "full_name": name,
                    "role": role,
                    "is_staff": staff,
                    "consent_given_at": timezone.now(),
                    "privacy_version": "seed",
                },
            )
            if created:
                user.set_password("DemoPass2026!")
                if staff:
                    user.is_superuser = True
                user.save()
            plan = Plan.objects.get(slug=plan_slug)
            sub = get_or_create_subscription(user)
            if sub is None or sub.plan_id != plan.id:
                activate_subscription(user, plan)
        self.stdout.write(f"  users: {User.objects.count()}")

    def seed_templates(self):
        """No DB rows needed — code defaults are used when absent. We create
        v1 rows only so admins have something to edit in the CMS."""
        created = 0
        for tool in TOOL_DEFINITIONS:
            if not PromptTemplate.objects.filter(tool_key=tool["key"]).exists():
                PromptTemplate.objects.create(
                    tool_key=tool["key"],
                    name=tool["name"],
                    system_prompt=tool["system"],
                    user_template=tool["template"],
                    version=1,
                )
                created += 1
        self.stdout.write(f"  templates created: {created}")

    def seed_blog(self):
        for post in BLOG_POSTS:
            BlogPost.objects.get_or_create(
                title=post["title"],
                defaults={
                    "excerpt": post["excerpt"],
                    "content": post["content"],
                    "status": BlogPost.Status.PUBLISHED,
                    "published_at": timezone.now(),
                },
            )
        self.stdout.write(f"  posts: {BlogPost.objects.count()}")

    def seed_site_content(self):
        for item in SITE_CONTENT:
            SiteContent.objects.update_or_create(key=item["key"], defaults=item)
        self.stdout.write(f"  site content: {SiteContent.objects.count()}")
