#!/usr/bin/env python3
"""Model linking conversations and users for persistence.

This association object is used when storing participant relationships in the
database layer.
"""

from .base import BaseModel


class ConversationParticipant(BaseModel):
    """Association with `conversation_id` and `user_id` fields."""

    def __init__(self, conversation_id, user_id, **kwargs):
        super().__init__(**kwargs)
        self.conversation_id = conversation_id
        self.user_id = user_id

    @property
    def conversation_id(self):
        return self._conversation_id

    @conversation_id.setter
    def conversation_id(self, value):
        """Set the conversation id after validation.

        Parameters
        ----------
        value : str
            Conversation identifier. Must be a non-empty string.

        Raises
        ------
        TypeError
            If `value` is not a string.
        ValueError
            If `value` is empty or falsy.
        """
        self._conversation_id = self.validate_conversation_id(value)

    @property
    def user_id(self):
        return self._user_id

    @user_id.setter
    def user_id(self, value):
        """Set the user id after validation.

        Parameters
        ----------
        value : str
            User identifier. Must be a non-empty string.

        Raises
        ------
        TypeError
            If `value` is not a string.
        ValueError
            If `value` is empty or falsy.
        """
        self._user_id = self.validate_user_id(value)

    @staticmethod
    def validate_conversation_id(value):
        """Validate a conversation id value.

        Parameters
        ----------
        value : Any
            Value to validate as a conversation id.

        Returns
        -------
        str
            The validated (and normalized) conversation id.

        Raises
        ------
        TypeError
            If the value is not a string.
        ValueError
            If the value is empty or only whitespace.
        """
        if not isinstance(value, str):
            raise TypeError('conversation_id must be a string')
        v = value.strip()
        if not v:
            raise ValueError('conversation_id is required')
        return v

    @staticmethod
    def validate_user_id(value):
        """Validate a user id value.

        See `validate_conversation_id` for behaviour; this is a simple alias
        specialized for user ids.
        """
        if not isinstance(value, str):
            raise TypeError('user_id must be a string')
        v = value.strip()
        if not v:
            raise ValueError('user_id is required')
        return v
