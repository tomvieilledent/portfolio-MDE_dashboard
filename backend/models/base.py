#!/usr/bin/env python3
import uuid
from datetime import datetime, timezone


class BaseModel:
    """Small BaseModel providing common fields and utilities used by models.

    This is a lightweight non-ORM base used by the project's current model style.
    """

    def __init__(self, **kwargs):
        self.id = kwargs.get("id") or uuid.uuid4()
        self.is_active = kwargs.get("is_active", True)
        self.created_at = kwargs.get(
            "created_at") or datetime.now(timezone.utc)
        self.updated_at = kwargs.get("updated_at")
        # optional timestamp for when a resource/file was uploaded
        self.uploaded_at = kwargs.get("uploaded_at")
        self.deactivate_by = kwargs.get("deactivate_by")
        self.delete_by = kwargs.get("delete_by")

    def to_dict(self):
        data = {k: v for k, v in self.__dict__.items() if not k.startswith("_")}
        return data
