import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    ForgotPasswordSerializer,
    PasswordChangeSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UpdateProfileSerializer,
    UserSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


class AuthThrottle(AnonRateThrottle):
    scope = "auth"


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    throttle_classes = (AuthThrottle,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user).data, "tokens": tokens_for(user)},
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    def delete(self, request):
        """NDPR right-to-erasure: permanently delete account and personal data."""
        password = request.data.get("password", "")
        if not request.user.check_password(password):
            return Response(
                {"detail": "Password confirmation required to delete your account."},
                status=status.HTTP_403_FORBIDDEN,
            )
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LogoutView(APIView):
    """Blacklist the refresh token so it can no longer mint access tokens."""

    def post(self, request):
        refresh = request.data.get("refresh", "")
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except Exception:
                pass  # already blacklisted / malformed — logout proceeds
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordChangeView(APIView):
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password updated."})


class PasswordForgotView(APIView):
    """Sends a reset link. Always 200 — never reveals whether the email exists."""

    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthThrottle,)

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        user = User.objects.filter(email__iexact=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            try:
                send_mail(
                    subject="Reset your TabsSoft AI Suite password",
                    message=(
                        f"Hi {user.full_name or 'there'},\n\n"
                        f"Use this link to set a new password (valid 24 hours):\n\n{link}\n\n"
                        "If you didn't request this, you can ignore this email.\n\n"
                        "— TabsSoft Global Technologies"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                logger.exception("Password reset email failed for %s", email)
        return Response(
            {"detail": "If that email is registered, a reset link is on its way."}
        )


class PasswordResetView(APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthThrottle,)

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(
                pk=force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            )
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response(
                {"detail": "This reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password reset. You can sign in now."})
