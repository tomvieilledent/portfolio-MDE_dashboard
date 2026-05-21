#!/usr/bin/env python3
from .base import BaseModel


class Company(BaseModel):
    """Company model with simple validation on fields."""

    def __init__(self, name, description=None, website_link=None, company_picture=None, admin_id=None, **kwargs):
        super().__init__(**kwargs)
        self.name = name
        self.description = description
        self.website_link = website_link
        self.company_picture = company_picture
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
