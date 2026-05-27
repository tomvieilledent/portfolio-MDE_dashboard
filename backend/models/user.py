#!/usr/bin/env python3
"""Domain model representing application users.

This module defines the `User` domain object used for input validation
and simple field-level checks before the service layer performs hashing
and persistence through the facades.
"""

from .base import BaseModel
from email_validator import validate_email, EmailNotValidError


class User(BaseModel):
    """User model with property-based validation.

    The `User` object validates email, password and optional profile fields.
    Password hashing is intentionally not performed at this layer and should
    be handled by the service or facade layer when persisting.
    """

    def __init__(self, email, password, first_name=None, last_name=None, **kwargs):
        super().__init__(**kwargs)
        self.email = email
        self.password = password
        self.first_name = first_name
        self.last_name = last_name
        self.phone = kwargs.get("phone")
        self.profile_picture = kwargs.get("profile_picture")
        self.business_card = kwargs.get("business_card")
        self.is_super_admin = kwargs.get("is_super_admin", False)
        self.company_id = kwargs.get("company_id")

    # Email
    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, email):
        if not isinstance(email, str):
            raise TypeError("Email must be a string.")
        email = email.strip()
        if not email:
            raise ValueError("Email cannot be empty.")
        try:
            # validate_email raises EmailNotValidError on invalid
            validate_email(email, check_deliverability=False)
        except EmailNotValidError:
            raise ValueError("Invalid email address format.")
        if len(email) > 254:
            raise ValueError("Email must be 254 characters or fewer")
        self._email = email.lower()

    # Password - kept simple here; hashing should be applied elsewhere
    @property
    def password(self):
        return self._password

    @password.setter
    def password(self, pwd):
        if not isinstance(pwd, str):
            raise TypeError("Password must be a string.")
        if len(pwd) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(pwd) > 256:
            raise ValueError("Password must be 256 characters or fewer")
        self._password = pwd

    # First name
    @property
    def first_name(self):
        return self._first_name

    @first_name.setter
    def first_name(self, first_name):
        if first_name is None:
            self._first_name = None
            return
        if not isinstance(first_name, str):
            raise TypeError("First name must be a string.")
        first_name = first_name.strip()
        if not first_name:
            raise ValueError("First name cannot be empty.")
        if len(first_name) > 100:
            raise ValueError("First name cannot exceed 100 characters.")
        self._first_name = first_name

    # Last name
    @property
    def last_name(self):
        return self._last_name

    @last_name.setter
    def last_name(self, last_name):
        if last_name is None:
            self._last_name = None
            return
        if not isinstance(last_name, str):
            raise TypeError("Last name must be a string.")
        last_name = last_name.strip()
        if not last_name:
            raise ValueError("Last name cannot be empty.")
        if len(last_name) > 100:
            raise ValueError("Last name cannot exceed 100 characters.")
        self._last_name = last_name
