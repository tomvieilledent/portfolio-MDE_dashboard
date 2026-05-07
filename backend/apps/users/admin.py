from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("email", "uuid", "phone", "is_staff",
                    "is_active", "is_superuser", "updated_at")
    list_filter = ("is_staff", "is_active",
                   "is_superuser", "groups", "updated_at")
    search_fields = ("email", "phone", "uuid", "first_name", "last_name")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("uuid", "email", "username", "password")}),
        ("Personal info", {
            "fields": ("first_name", "last_name", "phone", "bio", "avatar", "business_card")
        }),
        ("Permissions", {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")
        }),
        ("Deactivation", {
            "fields": ("deactivated_by",)
        }),
        ("Important dates", {
            "fields": ("last_login", "date_joined", "updated_at")
        }),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "password1", "password2", "phone", "first_name", "last_name",
                       "is_active", "is_staff", "is_superuser"),
        }),
    )

    readonly_fields = ("uuid", "updated_at", "date_joined")
