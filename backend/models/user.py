#!/usr/bin/env python3

class User(BaseModel):
    
    #Email
    @property
    def email(self):
        """Return the user's email."""
        return self._email

    @email.setter
    def email(self, email):
        """Set and validate the user's email."""
        if not isinstance(email, str):
            raise TypeError("Email must be a string.")
        email = email.strip()
        if not email:
            raise ValueError("Email cannot be empty.")
        try:
            validate_email(email, check_deliverability=False)
        except EmailNotValidError:
            raise TypeError("Invalid email address format.")
        self._email = email

    #Password

    #First name
    @property
    def first_name(self):
        """Return the user's first name."""
        return self._first_name
    
    @first_name.setter
    def first_name(self, first_name):
        """Set and validate the user's first name."""
        if not isinstance(first_name, str):
            raise TypeError("First name must be a string.")
        if not first_name:
            raise ValueError("First name cannot be empty.")
        if len(first_name) > 100:
            raise ValueError("First name cannot be exceed 100 charaters.")
        self._first_name = first_name

    #Last name
    @property
    def last_name(self):
        """Return the user's last name."""
        return self._last_name
    
    @last_name.setter
    def last_name(self, last_name):
        """Set and validate the user's last name."""
        if not isinstance(last_name, str):
            raise TypeError("Last name must be a string.")
        if not last_name:
            raise ValueError("Last name cannot be empty.")
        if len(last_name) > 100:
            raise ValueError("Last name cannot be exceed 100 charaters.")
        self._last_name = last_name