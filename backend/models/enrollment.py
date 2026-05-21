#!/usr/bin/env python3
from .base import BaseModel
from datetime import datetime


class Enrollment(BaseModel):
    def __init__(self, user_id, training_id, enrolled_at=None, **kwargs):
        super().__init__(**kwargs)
        self.user_id = user_id
        self.training_id = training_id
        self.enrolled_at = enrolled_at or datetime.utcnow()

    @property
    def user_id(self):
        return self._user_id

    @user_id.setter
    def user_id(self, value):
        if not value:
            raise ValueError("user_id is required for Enrollment")
        self._user_id = value

    @property
    def training_id(self):
        return self._training_id

    @training_id.setter
    def training_id(self, value):
        if not value:
            raise ValueError("training_id is required for Enrollment")
        self._training_id = value
