#!/root/Holberton/portfolio-MDE_dashboard/.venv/bin/python
"""Create or update the default super admin account.

This script creates the `admin@admin.com` account with the password
`admin` and marks it as super admin. If the account already exists,
it updates the password and flags.

Usage:
    ./create_super_admin.py
"""

from werkzeug.security import generate_password_hash

from backend.persistence.db import SessionLocal
from backend.persistence.models import User as ORMUser

DEFAULT_EMAIL = "admin@admin.com"
DEFAULT_PASSWORD = "admin"
DEFAULT_FIRST_NAME = "Super"
DEFAULT_LAST_NAME = "Admin"


def main() -> int:
    """Create or update the default super admin user."""
    session = SessionLocal()
    try:
        user = session.query(ORMUser).filter(
            ORMUser.email == DEFAULT_EMAIL).first()
        password_hash = generate_password_hash(DEFAULT_PASSWORD)

        if user is None:
            user = ORMUser(
                email=DEFAULT_EMAIL,
                password_hash=password_hash,
                first_name=DEFAULT_FIRST_NAME,
                last_name=DEFAULT_LAST_NAME,
            )
            setattr(user, "is_super_admin", True)
            setattr(user, "is_active", True)
            session.add(user)
            session.commit()
            print(f"Created super admin: {DEFAULT_EMAIL}")
            return 0

        setattr(user, "password_hash", password_hash)
        setattr(user, "first_name", DEFAULT_FIRST_NAME)
        setattr(user, "last_name", DEFAULT_LAST_NAME)
        setattr(user, "is_super_admin", True)
        setattr(user, "is_active", True)
        session.add(user)
        session.commit()
        print(f"Updated super admin: {DEFAULT_EMAIL}")
        return 0
    except Exception as exc:
        session.rollback()
        print(f"Error: {exc}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    raise SystemExit(main())
