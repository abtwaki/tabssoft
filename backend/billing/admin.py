from django.contrib import admin

from .models import PaymentTransaction, Plan, Subscription


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "price_ngn", "monthly_quota", "is_active", "sort_order")
    list_editable = ("price_ngn", "monthly_quota", "is_active", "sort_order")


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "status", "current_period_end", "cancel_at_period_end")
    list_filter = ("status", "plan")
    search_fields = ("user__email",)


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("reference", "user", "plan", "amount_ngn", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("reference", "user__email")
    readonly_fields = ("raw_response",)
