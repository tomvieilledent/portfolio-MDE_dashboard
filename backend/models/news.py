#!/usr/bin/env python3
"""Domain model for news items.

Used to validate scraped or imported news prior to storage.
"""

from .base import BaseModel


class News(BaseModel):
    """News item with basic validation for title and optional metadata."""

    def __init__(self, title, source=None, summary=None, url=None, published_at=None, **kwargs):
        super().__init__(**kwargs)
        self.title = title
        self.source = source
        self.summary = summary
        self.url = url
        self.published_at = published_at

    @property
    def title(self):
        return self._title

    @title.setter
    def title(self, value):
        if not isinstance(value, str):
            raise TypeError("News title must be a string")
        value = value.strip()
        if not value:
            raise ValueError("News title cannot be empty")
        if len(value) > 500:
            raise ValueError("News title must be 500 characters or fewer")
        self._title = value
