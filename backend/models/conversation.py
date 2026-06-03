#!/usr/bin/env python3
"""Domain model for conversations (chat rooms)."""

from .base import BaseModel


class Conversation(BaseModel):
    """Conversation model representing a chat room.

    Attributes:
        participant_ids (list[str]): List of user UUIDs participating in the room.
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
