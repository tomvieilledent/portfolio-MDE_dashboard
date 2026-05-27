"""Facades for training persistence operations.

Provides `TrainingFacade` which wraps SQLAlchemy access for trainings.
"""

from backend.persistence.db import SessionLocal
from backend.persistence.models import Training as ORMTraining
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from typing import Any


class TrainingFacade:
    """SQL-backed facade for training entities."""

    def __init__(self):
        pass

    def create(self, title, company_id=None, **kwargs):
        db = SessionLocal()
        try:
            t = ORMTraining(
                title=title.strip(),
                company_id=company_id,
                description=kwargs.get('description'),
                picture=kwargs.get('picture'),
                created_at=datetime.now(timezone.utc)
            )
            db.add(t)
            db.commit()
            db.refresh(t)
            return self._to_dict(t)
        except IntegrityError:
            db.rollback()
            raise
        finally:
            db.close()

    def get(self, training_id):
        db = SessionLocal()
        t: Any = db.query(ORMTraining).filter(
            ORMTraining.id == training_id).first()
        db.close()
        return self._to_dict(t) if t else None

    def list(self, limit=100):
        db = SessionLocal()
        rows = db.query(ORMTraining).limit(limit).all()
        db.close()
        return [self._to_dict(r) for r in rows]

    def update(self, training_id, **kwargs):
        db = SessionLocal()
        try:
            training: Any = db.query(ORMTraining).filter(
                ORMTraining.id == training_id).first()
            if not training:
                return None
            for field in ('title', 'company_id', 'description', 'picture'):
                if field in kwargs:
                    setattr(training, field, kwargs.get(field))
            if 'is_active' in kwargs:
                training.is_active = bool(kwargs.get('is_active'))
            training.updated_at = datetime.now(timezone.utc)
            db.add(training)
            db.commit()
            db.refresh(training)
            return self._to_dict(training)
        finally:
            db.close()

    def deactivate(self, training_id, by=None):
        return self.update(training_id, is_active=False)

    def delete(self, training_id):
        db = SessionLocal()
        try:
            training: Any = db.query(ORMTraining).filter(
                ORMTraining.id == training_id).first()
            if not training:
                return False
            db.delete(training)
            db.commit()
            return True
        finally:
            db.close()

    def _to_dict(self, t):
        return {
            'id': t.id,
            'title': t.title,
            'company_id': t.company_id,
            'is_active': t.is_active,
            'created_at': t.created_at.isoformat() if t.created_at else None,
        }
