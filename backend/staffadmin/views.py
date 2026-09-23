from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ai_engine.models import PromptTemplate, UsageRecord
from ai_engine.serializers import PromptTemplateSerializer
from ai_engine.tools import TOOL_DEFINITIONS, TOOLS_BY_KEY
from billing.models import PaymentTransaction, Plan, Subscription
from cms.models import BlogPost, SiteContent
from cms.serializers import BlogPostDetailSerializer, SiteContentSerializer

User = get_user_model()


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


# ---------------------------------------------------------------------------
# Dashboard / analytics
# ---------------------------------------------------------------------------

class OverviewView(APIView):
    permission_classes = (IsStaff,)

    def get(self, request):
        start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        subs_by_tier = dict(
            Subscription.objects.filter(status__in=("active", "trialing"))
            .values_list("plan__slug")
            .annotate(n=Count("id"))
            .values_list("plan__slug", "n")
        )
        revenue = (
            PaymentTransaction.objects.filter(
                status=PaymentTransaction.Status.SUCCESS, paid_at__gte=start
            ).aggregate(total=Sum("amount_ngn"))["total"]
            or 0
        )
        top_tools = list(
            UsageRecord.objects.filter(created_at__gte=start)
            .values("tool_key")
            .annotate(n=Count("id"))
            .order_by("-n")[:10]
        )
        for t in top_tools:
            t["name"] = TOOLS_BY_KEY.get(t["tool_key"], {}).get("name", t["tool_key"])

        return Response(
            {
                "total_users": User.objects.count(),
                "active_subscribers": sum(subs_by_tier.values()),
                "subs_by_tier": subs_by_tier,
                "revenue_this_month_ngn": revenue,
                "generations_this_month": UsageRecord.objects.filter(
                    created_at__gte=start
                ).count(),
                "top_tools": top_tools,
                "posts_published": BlogPost.objects.filter(
                    status=BlogPost.Status.PUBLISHED
                ).count(),
            }
        )


class UsageAnalyticsView(APIView):
    permission_classes = (IsStaff,)

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        since = timezone.now() - timedelta(days=min(days, 365))
        per_tool = list(
            UsageRecord.objects.filter(created_at__gte=since)
            .values("tool_key")
            .annotate(count=Count("id"), tokens=Sum("output_tokens"))
            .order_by("-count")
        )
        for t in per_tool:
            t["name"] = TOOLS_BY_KEY.get(t["tool_key"], {}).get("name", t["tool_key"])

        per_tier = list(
            UsageRecord.objects.filter(created_at__gte=since)
            .values("user__subscription__plan__slug")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        for t in per_tier:
            t["plan"] = t.pop("user__subscription__plan__slug") or "none"

        daily = list(
            UsageRecord.objects.filter(created_at__gte=since)
            .extra(select={"day": "date(created_at)"})
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        return Response({"per_tool": per_tool, "per_tier": per_tier, "daily": daily})


# ---------------------------------------------------------------------------
# Subscriber management
# ---------------------------------------------------------------------------

class SubscriberListView(APIView):
    permission_classes = (IsStaff,)

    def get(self, request):
        search = request.query_params.get("search", "").strip()
        qs = User.objects.select_related("subscription__plan").order_by("-date_joined")
        if search:
            qs = qs.filter(email__icontains=search) | qs.filter(full_name__icontains=search)
        page = int(request.query_params.get("page", 1))
        per_page = 25
        start = (page - 1) * per_page
        users = qs[start : start + per_page]
        data = []
        for u in users:
            sub = getattr(u, "subscription", None)
            used = UsageRecord.objects.filter(
                user=u,
                created_at__gte=timezone.now().replace(
                    day=1, hour=0, minute=0, second=0, microsecond=0
                ),
            ).count()
            data.append(
                {
                    "id": u.id,
                    "email": u.email,
                    "full_name": u.full_name,
                    "role": u.role,
                    "is_staff": u.is_staff,
                    "date_joined": u.date_joined,
                    "plan": sub.plan.slug if sub else None,
                    "plan_name": sub.plan.name if sub else None,
                    "status": sub.status if sub else None,
                    "quota": sub.plan.monthly_quota if sub else 0,
                    "used_this_month": used,
                    "current_period_end": sub.current_period_end if sub else None,
                }
            )
        return Response({"count": qs.count(), "results": data})


class SubscriberDetailView(APIView):
    permission_classes = (IsStaff,)

    def patch(self, request, pk):
        user = User.objects.filter(pk=pk).first()
        if user is None:
            return Response({"detail": "Not found."}, status=404)

        plan_slug = request.data.get("plan")
        status_val = request.data.get("status")
        sub = getattr(user, "subscription", None)

        if plan_slug:
            plan = Plan.objects.filter(slug=plan_slug).first()
            if plan is None:
                return Response({"detail": "Unknown plan."}, status=400)
            if sub is None:
                sub = Subscription.objects.create(user=user, plan=plan)
            else:
                sub.plan = plan
        if status_val in dict(Subscription.Status.choices):
            if sub is None:
                return Response({"detail": "User has no subscription."}, status=400)
            sub.status = status_val
        if sub:
            sub.save()
        return Response({"detail": "Updated."})


# ---------------------------------------------------------------------------
# Prompt template management
# ---------------------------------------------------------------------------

class TemplateListView(APIView):
    permission_classes = (IsStaff,)

    def get(self, request):
        """Every tool, with its active DB template (or marked as default)."""
        db_templates = {
            t.tool_key: t
            for t in PromptTemplate.objects.filter(is_active=True)
        }
        out = []
        for tool in TOOL_DEFINITIONS:
            tpl = db_templates.get(tool["key"])
            out.append(
                {
                    "tool_key": tool["key"],
                    "tool_name": tool["name"],
                    "category": tool["category"],
                    "roles": tool.get("roles", []),
                    "has_override": tpl is not None,
                    "template": PromptTemplateSerializer(tpl).data if tpl else None,
                    "default_system_prompt": tool["system"],
                    "default_user_template": tool["template"],
                }
            )
        return Response(out)


class TemplateDetailView(APIView):
    permission_classes = (IsStaff,)

    def put(self, request, tool_key):
        tool = TOOLS_BY_KEY.get(tool_key)
        if tool is None:
            return Response({"detail": "Unknown tool."}, status=404)

        system_prompt = request.data.get("system_prompt", tool["system"])
        user_template = request.data.get("user_template", tool["template"])
        if not system_prompt or not user_template:
            return Response({"detail": "system_prompt and user_template required."}, status=400)

        # Deactivate old rows, create a new version (keeps history).
        existing = PromptTemplate.objects.filter(tool_key=tool_key)
        last = existing.order_by("-version").first()
        existing.update(is_active=False)
        tpl = PromptTemplate.objects.create(
            tool_key=tool_key,
            name=tool["name"],
            system_prompt=system_prompt,
            user_template=user_template,
            temperature=float(request.data.get("temperature", 0.7)),
            max_tokens=int(request.data.get("max_tokens") or 0),
            is_active=True,
            version=(last.version + 1) if last else 1,
            updated_by=request.user,
        )
        return Response(PromptTemplateSerializer(tpl).data)

    def delete(self, request, tool_key):
        """Reset to code defaults: deactivate all DB templates."""
        PromptTemplate.objects.filter(tool_key=tool_key).update(is_active=False)
        return Response({"detail": "Reset to default."})


# ---------------------------------------------------------------------------
# Blog CMS
# ---------------------------------------------------------------------------

class BlogListCreateView(generics.ListCreateAPIView):
    permission_classes = (IsStaff,)
    serializer_class = BlogPostDetailSerializer
    queryset = BlogPost.objects.all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class BlogDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsStaff,)
    serializer_class = BlogPostDetailSerializer
    queryset = BlogPost.objects.all()


# ---------------------------------------------------------------------------
# Site content
# ---------------------------------------------------------------------------

class SiteContentListView(generics.ListAPIView):
    permission_classes = (IsStaff,)
    serializer_class = SiteContentSerializer
    queryset = SiteContent.objects.all()


class SiteContentDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsStaff,)
    serializer_class = SiteContentSerializer
    queryset = SiteContent.objects.all()
    lookup_field = "key"
