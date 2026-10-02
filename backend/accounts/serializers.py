from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

User = get_user_model()

PRIVACY_VERSION = "ndpr-v1"


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=128, write_only=True)
    full_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.GENERAL)
    organization = serializers.CharField(max_length=200, required=False, allow_blank=True)
    consent = serializers.BooleanField()

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must accept the privacy policy to create an account."
            )
        return value

    def create(self, validated_data):
        from billing.services import get_or_create_subscription

        validated_data.pop("consent")
        password = validated_data.pop("password")
        user = User.objects.create_user(
            password=password,
            consent_given_at=timezone.now(),
            privacy_version=PRIVACY_VERSION,
            **validated_data,
        )
        get_or_create_subscription(user)  # every account starts on the free plan
        return user


class UserSerializer(serializers.ModelSerializer):
    subscription = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "role",
            "role_display",
            "organization",
            "is_staff",
            "date_joined",
            "subscription",
        )

    role_display = serializers.CharField(source="get_role_display", read_only=True)

    def get_subscription(self, obj):
        sub = getattr(obj, "subscription", None)
        if sub is None:
            return None
        return {
            "plan_slug": sub.plan.slug,
            "plan_name": sub.plan.name,
            "status": sub.status,
            "current_period_end": sub.current_period_end,
            "monthly_quota": sub.plan.monthly_quota,
        }


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("full_name", "role", "organization", "phone")


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, max_length=128, write_only=True)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, max_length=128, write_only=True)
