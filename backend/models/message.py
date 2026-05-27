#!/usr/bin/env python3
"""Domain model for messages exchanged between users.

This module contains the `Message` domain object which validates the
message `content` and provides a simple API used by services before
persistence.
"""

from .base import BaseModel


class Message(BaseModel):
    """Message entity containing author/content and optional references.

    The `Message` object validates `content` length and type. Other
    metadata (author_id, recipient_id, conversation_id) are handled by the
    persistence layer and set by service/facade code.

    Attributes
    ----------
    content : str
        The text content of the message (required, max 5000 chars).
    """

    @property
    def content(self):
        """Get the message content.

        Returns
        -------
        str
            The message text.
        """
        return self._content

    @content.setter
    def content(self, value):
        """Set and validate the message content.

        Parameters
        ----------
        value : str
            Message text; must be non-empty and at most 5000 characters.

        Raises
        ------
        TypeError
            If `value` is not a string.
        ValueError
            If `value` is empty or exceeds length limits.
        """
        if not isinstance(value, str):
            raise TypeError("Message content must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Message content cannot be empty")
        if len(value) > 5000:
            raise ValueError(
                "Message content must be 5000 characters or fewer")
        self._content = value
