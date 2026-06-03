"""Company persistence facade.

Provides `CompanyFacade` for creating, updating and listing companies.
"""

from backend.persistence.db import SessionLocal
from backend.persistence.models import Company as ORMCompany, User as ORMUser
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from typing import Any
from ._common_sql import isoformat


class CompanyFacade:
    """Facade to manage company rows in the database."""

    def __init__(self):
        pass

    def create(self, name, admin_email=None, admin_id=None, **kwargs):
        db = SessionLocal()
        try:
            resolved_admin_id = admin_id
            normalized_admin_email = admin_email.lower().strip() if admin_email else None
            if not normalized_admin_email:
                raise ValueError('admin_email is required')
            if normalized_admin_email and resolved_admin_id is None:
                admin_user = db.query(ORMUser).filter(
                    ORMUser.email == normalized_admin_email).first()
                if not admin_user:
                    raise ValueError('admin_email not found')
                resolved_admin_id = admin_user.id
            c = ORMCompany(
                name=name.strip(),
                admin_email=normalized_admin_email,
                admin_id=resolved_admin_id,
                description=kwargs.get('description'),
                website_link=kwargs.get('website_link'),
                company_picture=kwargs.get('company_picture'),
                created_at=datetime.now(timezone.utc)
            )
            db.add(c)
            db.commit()
            db.refresh(c)
            return self._to_dict(c)
        except IntegrityError:
            db.rollback()
            raise
        except ValueError:
            db.rollback()
            raise
        finally:
            db.close()

    def get(self, company_id):
        db = SessionLocal()
        c: Any = db.query(ORMCompany).filter(
            ORMCompany.id == company_id).first()
        db.close()
        return self._to_dict(c) if c else None

    def list(self, limit=100):
        db = SessionLocal()
        rows = db.query(ORMCompany).limit(limit).all()
        db.close()
        return [self._to_dict(r) for r in rows]

    def update(self, company_id, **kwargs):
        db = SessionLocal()
        try:
            company: Any = db.query(ORMCompany).filter(
                ORMCompany.id == company_id).first()
            if not company:
                return None
            for field in ('name', 'description', 'website_link', 'company_picture', 'admin_email', 'admin_id'):
                if field in kwargs:
                    setattr(company, field, kwargs.get(field))
            if 'is_active' in kwargs:
                company.is_active = bool(kwargs.get('is_active'))
            company.updated_at = datetime.now(timezone.utc)
            db.add(company)
            db.commit()
            db.refresh(company)
            return self._to_dict(company)
        finally:
            db.close()

    def deactivate(self, company_id, by=None):
        return self.update(company_id, is_active=False)

    def delete(self, company_id):
        db = SessionLocal()
        try:
            company: Any = db.query(ORMCompany).filter(
                ORMCompany.id == company_id).first()
            if not company:
                return False
            db.delete(company)
            db.commit()
            return True
        finally:
            db.close()

    def _to_dict(self, c):
        return {
            'id': c.id,
            'name': c.name,
            'admin_email': c.admin_email,
            'admin_id': c.admin_id,
            'description': c.description,
            'website_link': c.website_link,
            'company_picture': c.company_picture,
            'is_active': c.is_active,
            'created_at': isoformat(c.created_at),
            'updated_at': isoformat(getattr(c, 'updated_at', None)),
            'deactivate_by': getattr(c, 'deactivate_by', None),
            'delete_by': getattr(c, 'delete_by', None),
            'uploaded_at': isoformat(getattr(c, 'uploaded_at', None)),
        }
