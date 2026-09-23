from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "handled", "created_at")
    list_filter = ("handled", "created_at")
    search_fields = ("subject", "name", "email")
    readonly_fields = ("name", "email", "subject", "message", "created_at")
