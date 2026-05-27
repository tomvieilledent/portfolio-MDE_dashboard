#!/usr/bin/env python3
"""Domain model representing a user's enrollment in a training.

`FormationUser` stores enrollment timestamp, status and progress.
"""

from .base import BaseModel
from datetime import datetime, timezone


class FormationUser(BaseModel):
    """Association linking `user_id` and `training_id` with progress/state."""

    def __init__(self, user_id, training_id, enrolled_at=None, status=None, progress=None, **kwargs):
        super().__init__(**kwargs)
        self.user_id = user_id
        self.training_id = training_id
        self.enrolled_at = enrolled_at or datetime.now(timezone.utc)
        self.status = status
        self.progress = progress

    @property
    def user_id(self):
        return self._user_id

    @user_id.setter
    def user_id(self, value):
        if not value:
            raise ValueError("user_id is required for FormationUser")
        self._user_id = value

    @property
    def training_id(self):
        return self._training_id

    @training_id.setter
    def training_id(self, value):
        if not value:
            raise ValueError("training_id is required for FormationUser")
        self._training_id = value

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        # simple status validation (optional): allow None or limited set
        allowed = {None, 'pending', 'active', 'completed', 'cancelled'}
        if value not in allowed:
            raise ValueError(f"Invalid status: {value}")
        self._status = value

    @property
    def progress(self):
        return self._progress

    @progress.setter
    def progress(self, value):
        if value is None:
            self._progress = None
            return
        try:
            v = float(value)
        except Exception:
            raise TypeError("progress must be a number between 0 and 100")
        if v < 0 or v > 100:
            raise ValueError("progress must be between 0 and 100")
        self._progress = v
