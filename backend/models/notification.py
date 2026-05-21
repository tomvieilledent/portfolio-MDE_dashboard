#!/usr/bin/env python3
from .base import BaseModel


class Notification(BaseModel):
    def __init__(self, recipient_id, content, is_read=False, **kwargs):
        super().__init__(**kwargs)
        self.recipient_id = recipient_id
        self.content = content
        self.is_read = is_read

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
            raise ValueError("Notification content must be 1000 characters or fewer")
        self._content = value
