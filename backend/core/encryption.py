"""Field-level encryption using Fernet (AES-128-CBC + HMAC).

Sensitive user content (saved documents, contact messages) is encrypted at
rest. The key comes from FIELD_ENCRYPTION_KEY; in DEBUG a derived ephemeral
key is used so development works without configuration.
"""

import base64
import hashlib
import os

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.db import models

_fernet = None


def _get_fernet():
    global _fernet
    if _fernet is None:
        key = getattr(settings, "FIELD_ENCRYPTION_KEY", "") or ""
        if not key:
            if settings.DEBUG:
                digest = hashlib.sha256(
                    (settings.SECRET_KEY + ":field-encryption").encode()
                ).digest()
                key = base64.urlsafe_b64encode(digest).decode()
            else:
                raise RuntimeError(
                    "FIELD_ENCRYPTION_KEY must be set when DEBUG is off."
                )
        _fernet = Fernet(key.encode() if isinstance(key, str) else key)
    return _fernet


def encrypt_text(plaintext):
    if plaintext is None:
        return None
    return _get_fernet().encrypt(plaintext.encode("utf-8")).decode("ascii")


def decrypt_text(token):
    if token is None:
        return None
    try:
        return _get_fernet().decrypt(token.encode("ascii")).decode("utf-8")
    except InvalidToken:
        return ""


class EncryptedTextField(models.TextField):
    """Transparently encrypts/decrypts a TextField at rest."""

    description = "Text encrypted at rest with Fernet"

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return decrypt_text(value)

    def to_python(self, value):
        if value is None or not isinstance(value, str):
            return value
        return value

    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        if value is None or value == "":
            return value
        # Avoid double-encrypting values already decrypted by from_db_value.
        return encrypt_text(value)


def generate_key():
    """Helper for ops: prints a fresh Fernet key."""
    return Fernet.generate_key().decode()
