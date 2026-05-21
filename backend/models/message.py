#!/usr/bin/env python3
from .base import BaseModel


class Message(BaseModel):
    def __init__(self, author_id, content, recipient_id=None, conversation_id=None, **kwargs):
        super().__init__(**kwargs)
        self.author_id = author_id
        self.recipient_id = recipient_id
        self.conversation_id = conversation_id
        self.content = content

    @property
    def content(self):
        return self._content

    @content.setter
    def content(self, value):
        if not isinstance(value, str):
            raise TypeError("Message content must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Message content cannot be empty")
        if len(value) > 5000:
            raise ValueError("Message content must be 5000 characters or fewer")
        self._content = value
