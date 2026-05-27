"""User persistence facade (SQLAlchemy).

Provides `UserFacade` which encapsulates common user database operations
used by the service layer (create, lookup, update, deactivate).
"""

from backend.persistence.db import SessionLocal
from backend.persistence.models import User as ORMUser
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from typing import Any
from ._common_sql import isoformat


class UserFacade:
    """Simple SQLAlchemy-backed facade for User operations."""

    def __init__(self):
        pass

    def create_user(self, email, password, first_name=None, last_name=None, **kwargs):
        db = SessionLocal()
        try:
            password_hash = generate_password_hash(password)
            user = ORMUser(
                email=email.lower().strip(),
                password_hash=password_hash,
                first_name=first_name,
                last_name=last_name,
                phone=kwargs.get('phone'),
                profile_picture=kwargs.get('profile_picture'),
                business_card=kwargs.get('business_card'),
                is_super_admin=kwargs.get('is_super_admin', False),
                company_id=kwargs.get('company_id'),
                is_active=kwargs.get('is_active', True),
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return self._to_dict(user)
        except IntegrityError:
            db.rollback()
            raise
        finally:
            db.close()

    def get_by_email(self, email):
        db = SessionLocal()
        u: Any = db.query(ORMUser).filter(
            ORMUser.email == email.lower().strip()).first()
        db.close()
        if not u:
            return None
        return self._to_dict(u)

    def get_by_id(self, user_id):
        db = SessionLocal()
        u: Any = db.query(ORMUser).filter(ORMUser.id == user_id).first()
        db.close()
        return self._to_dict(u) if u else None

    def list_users(self, limit=100, company_id=None):
        db = SessionLocal()
        query = db.query(ORMUser)
        if company_id:
            query = query.filter(ORMUser.company_id == company_id)
        rows = query.limit(limit).all()
        db.close()
        return [self._to_dict(row) for row in rows]

    def check_password(self, email, password):
        db = SessionLocal()
        u: Any = db.query(ORMUser).filter(
            ORMUser.email == email.lower().strip()).first()
        db.close()
        if not u:
            return False
        return check_password_hash(u.password_hash, password)

    def deactivate(self, identifier, by=None):
        """Deactivate a user by email or id (identifier).

        If identifier contains '@', it's treated as an email address.
        Otherwise it's treated as a user id.
        """
        db = SessionLocal()
        u: Any
        if isinstance(identifier, str) and '@' in identifier:
            u = db.query(ORMUser).filter(ORMUser.email ==
                                         identifier.lower().strip()).first()
        else:
            u = db.query(ORMUser).filter(ORMUser.id == identifier).first()
        if not u:
            db.close()
            return False
        # assign values on the mapped object
        u.is_active = False
        u.deactivate_by = by
        u.updated_at = datetime.now(timezone.utc)
        db.add(u)
        db.commit()
        db.close()
        return True

    def update(self, user_id, **kwargs):
        db = SessionLocal()
        try:
            u: Any = db.query(ORMUser).filter(ORMUser.id == user_id).first()
            if not u:
                return None
            for field in ('first_name', 'last_name', 'phone', 'profile_picture', 'business_card', 'company_id'):
                if field in kwargs:
                    setattr(u, field, kwargs.get(field))
            if 'is_super_admin' in kwargs:
                u.is_super_admin = bool(kwargs.get('is_super_admin'))
            if 'is_active' in kwargs:
                u.is_active = bool(kwargs.get('is_active'))
            u.updated_at = datetime.now(timezone.utc)
            db.add(u)
            db.commit()
            db.refresh(u)
            return self._to_dict(u)
        finally:
            db.close()

    def delete(self, user_id):
        """Permanently delete a user by id.

        Returns
        -------
        bool
            True when a user row was deleted, False when no user was found.
        """
        db = SessionLocal()
        try:
            user: Any = db.query(ORMUser).filter(ORMUser.id == user_id).first()
            if not user:
                return False
            db.delete(user)
            db.commit()
            return True
        finally:
            db.close()

    def reset_password(self, user_id, password):
        db = SessionLocal()
        try:
            u: Any = db.query(ORMUser).filter(ORMUser.id == user_id).first()
            if not u:
                return None
            u.password_hash = generate_password_hash(password)
            u.updated_at = datetime.now(timezone.utc)
            db.add(u)
            db.commit()
            return True
        finally:
            db.close()

    def _to_dict(self, u):
        return {
            'id': u.id,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'phone': u.phone,
            'is_super_admin': u.is_super_admin,
            'is_active': u.is_active,
            'created_at': isoformat(u.created_at),
            'updated_at': isoformat(u.updated_at) if hasattr(u, 'updated_at') else None,
            'deactivate_by': getattr(u, 'deactivate_by', None),
            'delete_by': getattr(u, 'delete_by', None),
            'uploaded_at': isoformat(getattr(u, 'uploaded_at', None)),
        }
