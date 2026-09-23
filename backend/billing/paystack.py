"""Paystack REST client.

All payment-provider logic is isolated here so a different provider
(Flutterwave etc.) can be swapped in by implementing the same surface:
initialize_transaction, verify_transaction, create_subscription,
cancel_subscription, verify_webhook_signature.
"""

import hashlib
import hmac
import uuid

import requests
from django.conf import settings


class PaystackError(Exception):
    pass


def _headers():
    if not settings.PAYSTACK_SECRET_KEY:
        raise PaystackError("PAYSTACK_SECRET_KEY is not configured.")
    return {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def _request(method, path, **kwargs):
    url = f"{settings.PAYSTACK_BASE_URL}{path}"
    resp = requests.request(method, url, headers=_headers(), timeout=30, **kwargs)
    try:
        data = resp.json()
    except ValueError:
        raise PaystackError(f"Paystack returned HTTP {resp.status_code}")
    if not resp.ok or not data.get("status"):
        raise PaystackError(data.get("message") or f"Paystack HTTP {resp.status_code}")
    return data.get("data", data)


def generate_reference():
    return f"tsg_{uuid.uuid4().hex[:24]}"


def initialize_transaction(email, amount_ngn, callback_url, metadata=None):
    """Returns dict with authorization_url, access_code, reference."""
    payload = {
        "email": email,
        "amount": int(amount_ngn * 100),  # kobo
        "currency": settings.PAYSTACK_CURRENCY,
        "callback_url": callback_url,
        "reference": generate_reference(),
        "metadata": metadata or {},
    }
    return _request("POST", "/transaction/initialize", json=payload)


def verify_transaction(reference):
    return _request("GET", f"/transaction/verify/{reference}")


def create_subscription(customer_email, plan_code, authorization=None):
    payload = {"customer": customer_email, "plan": plan_code}
    if authorization:
        payload["authorization"] = authorization
    return _request("POST", "/subscription", json=payload)


def cancel_subscription(subscription_code, email_token):
    return _request(
        "POST",
        "/subscription/disable",
        json={"code": subscription_code, "token": email_token},
    )


def verify_webhook_signature(raw_body, signature_header):
    if not settings.PAYSTACK_SECRET_KEY:
        return False
    digest = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode(), raw_body, hashlib.sha512
    ).hexdigest()
    return hmac.compare_digest(digest, signature_header or "")
