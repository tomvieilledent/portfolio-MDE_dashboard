from backend.persistence.db import SessionLocal
from backend.persistence.models import Company as ORMCompany
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from typing import Any


class CompanyFacade:
    def __init__(self):
           pass

    def create(self, name, admin_email=None, admin_id=None, **kwargs):
        db = SessionLocal()
        try:
            c = ORMCompany(
                name=name.strip(),
                admin_email=admin_email.lower().strip() if admin_email else None,
                admin_id=admin_id,
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
            'is_active': c.is_active,
            'created_at': c.created_at.isoformat() if c.created_at else None,
        }
