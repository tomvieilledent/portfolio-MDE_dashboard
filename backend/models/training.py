#!/usr/bin/env python3
"""Domain model for trainings.

`Training` validates title and optional description/picture fields used by
the service layer before persistence.
"""

from .base import BaseModel


class Training(BaseModel):
    """Training metadata and validation.

    Attributes
    ----------
    title : str
        Training title (required).
    company_id : str | None
        Optional owning company id.
    """

    def __init__(self, title, company_id=None, description=None, picture=None, **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.company_id = company_id
        self.description = description
        self.picture = picture

    @property
    def title(self):
        return self._title

    @title.setter
    def title(self, value):
        if not isinstance(value, str):
            raise TypeError("Training title must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Training title cannot be empty")
        if len(value) > 200:
            raise ValueError("Training title must be 200 characters or fewer")
        self._title = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        if value is None:
            self._description = None
            return
        if not isinstance(value, str):
            raise TypeError("Description must be a string")
        if len(value) > 2000:
            raise ValueError("Description must be 2000 characters or fewer")
        self._description = value.strip()
