#!/usr/bin/env python3
from .base import BaseModel


class Conversation(BaseModel):
    def __init__(self, title=None, participant_ids=None, **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.participant_ids = participant_ids or []

    @property
    def title(self):
        return self._title

    @title.setter
    def title(self, value):
        if value is None:
            self._title = None
            return
        if not isinstance(value, str):
            raise TypeError("Conversation title must be a string")
        if len(value) > 200:
            raise ValueError("Conversation title must be 200 characters or fewer")
        self._title = value.strip()

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
