"""Facade for formation/user enrollment relations."""

from datetime import datetime, timezone
from typing import Any

from backend.persistence.models import FormationUser as ORMFormationUser
from ._common_sql import isoformat, normalize_text, session_scope


class FormationUserFacade:
    """Manage FormationUser relations (enrollments)."""

    def __init__(self):
        pass

    def create(self, user_id, training_id, enrolled_at=None, status=None, progress=None, **kwargs):
        with session_scope() as db:
            relation = ORMFormationUser(
                user_id=user_id,
                training_id=training_id,
                enrolled_at=enrolled_at or datetime.now(timezone.utc),
                status=normalize_text(status),
                progress=normalize_text(progress),
            )
            db.add(relation)
            db.flush()
            db.refresh(relation)
            return self._to_dict(relation)

    def get(self, relation_id):
        with session_scope() as db:
            relation: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.id == relation_id).first()
            return self._to_dict(relation) if relation else None

    def list(self, limit=100):
        with session_scope() as db:
            rows = db.query(ORMFormationUser).order_by(
                ORMFormationUser.enrolled_at.desc()).limit(limit).all()
            return [self._to_dict(row) for row in rows]

    def list_by_user(self, user_id, limit=100):
        with session_scope() as db:
            rows = (
                db.query(ORMFormationUser)
                .filter(ORMFormationUser.user_id == user_id)
                .order_by(ORMFormationUser.enrolled_at.desc())
                .limit(limit)
                .all()
            )
            return [self._to_dict(row) for row in rows]

    def list_by_training(self, training_id, limit=100):
        with session_scope() as db:
            rows = (
                db.query(ORMFormationUser)
                .filter(ORMFormationUser.training_id == training_id)
                .order_by(ORMFormationUser.enrolled_at.desc())
                .limit(limit)
                .all()
            )
            return [self._to_dict(row) for row in rows]

    def update(self, relation_id, **kwargs):
        with session_scope() as db:
            relation: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.id == relation_id).first()
            if not relation:
                return None
            if 'status' in kwargs:
                relation.status = normalize_text(kwargs.get('status'))
            if 'progress' in kwargs:
                relation.progress = normalize_text(kwargs.get('progress'))
            if 'enrolled_at' in kwargs and kwargs.get('enrolled_at') is not None:
                relation.enrolled_at = kwargs.get('enrolled_at')
            db.add(relation)
            db.flush()
            db.refresh(relation)
            return self._to_dict(relation)

    def delete(self, relation_id):
        with session_scope() as db:
            relation: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.id == relation_id).first()
            if not relation:
                return False
            db.delete(relation)
            return True

    def _to_dict(self, relation):
        return {
            'id': relation.id,
            'user_id': relation.user_id,
            'training_id': relation.training_id,
            'enrolled_at': isoformat(relation.enrolled_at),
            'status': relation.status,
            'progress': relation.progress,
        }
