#!/usr/bin/env python3
from .base import BaseModel


class ConversationParticipant(BaseModel):
    """Association model linking conversations and user ids for persistent storage.

    Fields:
    - conversation_id: required
    - user_id: required
    """

    def __init__(self, conversation_id, user_id, **kwargs):
        super().__init__(**kwargs)
        self.conversation_id = conversation_id
        self.user_id = user_id

    @property
    def conversation_id(self):
        return self._conversation_id

    @conversation_id.setter
    def conversation_id(self, value):
        if not value:
            raise ValueError("conversation_id is required")
        self._conversation_id = value

    @property
    def user_id(self):
        return self._user_id

    @user_id.setter
    def user_id(self, value):
        if not value:
            raise ValueError("user_id is required")
        self._user_id = value
