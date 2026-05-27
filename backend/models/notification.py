#!/usr/bin/env python3
"""Domain model for user notifications.

Simple container validating notification `content` length and type.
"""

from .base import BaseModel


class Notification(BaseModel):
    """Notification entity with `recipient_id`, `content` and `is_read`."""

    @property
    def content(self):
        return self._content

    @content.setter
    def content(self, value):
        if not isinstance(value, str):
            raise TypeError("Notification content must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Notification content cannot be empty")
        if len(value) > 1000:
            raise ValueError(
                "Notification content must be 1000 characters or fewer")
        self._content = value
