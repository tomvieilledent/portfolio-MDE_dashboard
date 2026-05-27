#!/usr/bin/env python3
"""Domain model for conversations (chat rooms).

`Conversation` represents a lightweight chat room composed of
participant identifiers. This object is used by services handling
real-time chat features; persistence is handled separately.
"""

from .base import BaseModel


class Conversation(BaseModel):
    """Conversation model for instant WebSocket chats.

    This model represents a transient chat/channel identified by participants.
    No title is stored because chats are real-time and managed via WebSocket sessions.
    """

    def __init__(self, participant_ids=None, **kwargs):
        super().__init__(**kwargs)
        self.participant_ids = participant_ids or []

    @property
    def participant_ids(self):
        return self._participant_ids

    @participant_ids.setter
    def participant_ids(self, value):
        if value is None:
            self._participant_ids = []
            return
        if not isinstance(value, (list, tuple)):
            raise TypeError("participant_ids must be a list of UUIDs")
        self._participant_ids = list(value)
