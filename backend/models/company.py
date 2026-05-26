#!/usr/bin/env python3
import uuid

from email_validator import EmailNotValidError, validate_email

from .base import BaseModel


class Company(BaseModel):
    """Company model with field validation.

    Creation flow:
    - the service layer may receive an admin email as an input only.
    - that email is used to resolve the related user UUID.
    - the company stores the admin reference in admin_id.
    """

    def __init__(
        self,
        name,
        admin_email=None,
        admin_id=None,
        description=None,
        website_link=None,
        company_picture=None,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.name = name
        self.description = description
        self.website_link = website_link
        self.company_picture = company_picture
        self.admin_email = admin_email
        self.admin_id = admin_id

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("Company name must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Company name cannot be empty")
        if len(value) > 200:
            raise ValueError("Company name must be 200 characters or fewer")
        self._name = value

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

    @property
    def website_link(self):
        return self._website_link

    @website_link.setter
    def website_link(self, value):
        if value is None:
            self._website_link = None
            return
        if not isinstance(value, str):
            raise TypeError("Website link must be a string URL")
        if len(value) > 512:
            raise ValueError("Website link must be 512 characters or fewer")
        self._website_link = value.strip()

    @property
    def company_picture(self):
        return self._company_picture

    @company_picture.setter
    def company_picture(self, value):
        if value is None:
            self._company_picture = None
            return
        if not isinstance(value, str):
            raise TypeError("Company picture must be a string address")
        value = value.strip()
        if not value:
            raise ValueError("Company picture cannot be empty")
        if len(value) > 512:
            raise ValueError("Company picture must be 512 characters or fewer")
        self._company_picture = value

    @property
    def admin_id(self):
        return self._admin_id

    @admin_id.setter
    def admin_id(self, value):
        if value is None:
            self._admin_id = None
            return
        if isinstance(value, uuid.UUID):
            self._admin_id = str(value)
            return
        if not isinstance(value, str):
            raise TypeError("Admin ID must be a string UUID")
        value = value.strip()
        if not value:
            raise ValueError("Admin ID cannot be empty")
        try:
            uuid.UUID(value)
        except ValueError as exc:
            raise ValueError("Admin ID must be a valid UUID") from exc
        self._admin_id = value

    @property
    def admin_email(self):
        return self._admin_email

    @admin_email.setter
    def admin_email(self, value):
        if value is None:
            self._admin_email = None
            return
        if not isinstance(value, str):
            raise TypeError("Admin email must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Admin email cannot be empty")
        if len(value) > 254:
            raise ValueError("Admin email must be 254 characters or fewer")
        try:
            validate_email(value, check_deliverability=False)
        except EmailNotValidError as exc:
            raise ValueError("Admin email must be a valid email address") from exc
        self._admin_email = value.lower()
