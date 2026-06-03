"""Facade for formation/user enrollment relations."""

from datetime import datetime, timezone
from typing import Any

import uuid

from backend.persistence.models import (
    FormationUser as ORMFormationUser,
    TrainingSession as ORMTrainingSession,
)
from ._common_sql import isoformat, session_scope


class FormationUserFacade:
    """Manage FormationUser relations (interest, enrollment, completion)."""

    # ------------------------------------------------------------------
    # Interest
    # ------------------------------------------------------------------

    def express_interest(self, user_id, training_id):
        """Create an 'interested' record. Idempotent if one already exists."""
        with session_scope() as db:
            existing: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.user_id == user_id,
                ORMFormationUser.training_id == training_id,
            ).first()
            if existing:
                return self._to_dict(existing)
            relation = ORMFormationUser(
                id=str(uuid.uuid4()),
                user_id=user_id,
                training_id=training_id,
                session_id=None,
                type='interested',
                enrolled_at=datetime.now(timezone.utc),
            )
            db.add(relation)
            db.flush()
            db.refresh(relation)
            return self._to_dict(relation)

    def remove_interest(self, user_id, training_id):
        """Delete the 'interested' record for this user+training pair."""
        with session_scope() as db:
            relation: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.user_id == user_id,
                ORMFormationUser.training_id == training_id,
                ORMFormationUser.type == 'interested',
            ).first()
            if not relation:
                return False
            db.delete(relation)
            return True

    # ------------------------------------------------------------------
    # Enrollment
    # ------------------------------------------------------------------

    def enroll(self, user_id, training_id, session_id):
        """Enroll user in a session, checking capacity and removing interest."""
        with session_scope() as db:
            s: Any = db.query(ORMTrainingSession).filter(
                ORMTrainingSession.id == session_id).first()
            if not s:
                return None, 'session not found'
            if s.status in ('completed', 'cancelled'):
                return None, f'session is {s.status}'
            enrolled_count = db.query(ORMFormationUser).filter(
                ORMFormationUser.session_id == session_id,
                ORMFormationUser.type == 'enrolled',
            ).count()
            if enrolled_count >= s.max_participants:
                return None, 'session is full'

            existing: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.user_id == user_id,
                ORMFormationUser.training_id == training_id,
            ).first()
            if existing and existing.type == 'enrolled':
                return None, 'already enrolled'
            if existing and existing.type == 'completed':
                return None, 'already completed this training'

            if existing:
                # upgrade interest → enrolled
                existing.session_id = session_id
                existing.type = 'enrolled'
                existing.enrolled_at = datetime.now(timezone.utc)
                db.add(existing)
                db.flush()
                db.refresh(existing)
                relation = existing
            else:
                relation = ORMFormationUser(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    training_id=training_id,
                    session_id=session_id,
                    type='enrolled',
                    enrolled_at=datetime.now(timezone.utc),
                )
                db.add(relation)
                db.flush()
                db.refresh(relation)

            new_count = enrolled_count + 1
            if new_count >= s.max_participants:
                s.status = 'full'
                db.add(s)

            return self._to_dict(relation), None

    def unenroll(self, user_id, training_id):
        """Remove an active enrollment and revert session to 'upcoming' if full."""
        with session_scope() as db:
            relation: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.user_id == user_id,
                ORMFormationUser.training_id == training_id,
                ORMFormationUser.type == 'enrolled',
            ).first()
            if not relation:
                return False
            session_id = relation.session_id
            db.delete(relation)
            db.flush()
            if session_id:
                s: Any = db.query(ORMTrainingSession).filter(
                    ORMTrainingSession.id == session_id).first()
                if s and s.status == 'full':
                    s.status = 'upcoming'
                    db.add(s)
            return True

    # ------------------------------------------------------------------
    # Completion management (admin)
    # ------------------------------------------------------------------

    def revoke_completion(self, relation_id):
        """Revert a completed enrollment back to enrolled."""
        with session_scope() as db:
            relation: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.id == relation_id,
                ORMFormationUser.type == 'completed',
            ).first()
            if not relation:
                return None
            relation.type = 'enrolled'
            relation.completed_at = None
            db.add(relation)
            db.flush()
            db.refresh(relation)
            return self._to_dict(relation)

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get(self, relation_id):
        with session_scope() as db:
            relation: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.id == relation_id).first()
            return self._to_dict(relation) if relation else None

    def get_by_user_training(self, user_id, training_id):
        with session_scope() as db:
            relation: Any = db.query(ORMFormationUser).filter(
                ORMFormationUser.user_id == user_id,
                ORMFormationUser.training_id == training_id,
            ).first()
            return self._to_dict(relation) if relation else None

    def list(self, limit=100):
        with session_scope() as db:
            rows = db.query(ORMFormationUser).order_by(
                ORMFormationUser.enrolled_at.desc()).limit(limit).all()
            return [self._to_dict(r) for r in rows]

    def list_by_user(self, user_id, type_filter=None, limit=100):
        with session_scope() as db:
            q = db.query(ORMFormationUser).filter(
                ORMFormationUser.user_id == user_id)
            if type_filter:
                q = q.filter(ORMFormationUser.type == type_filter)
            rows = q.order_by(ORMFormationUser.enrolled_at.desc()).limit(limit).all()
            return [self._to_dict(r) for r in rows]

    def list_by_training(self, training_id, type_filter=None, limit=100):
        with session_scope() as db:
            q = db.query(ORMFormationUser).filter(
                ORMFormationUser.training_id == training_id)
            if type_filter:
                q = q.filter(ORMFormationUser.type == type_filter)
            rows = q.order_by(ORMFormationUser.enrolled_at.desc()).limit(limit).all()
            return [self._to_dict(r) for r in rows]

    def list_completions(self, user_id=None, limit=500):
        with session_scope() as db:
            q = db.query(ORMFormationUser).filter(
                ORMFormationUser.type == 'completed')
            if user_id:
                q = q.filter(ORMFormationUser.user_id == user_id)
            rows = q.order_by(ORMFormationUser.completed_at.desc()).limit(limit).all()
            return [self._to_dict(r) for r in rows]

    def list_interested(self, training_id=None, limit=500):
        with session_scope() as db:
            q = db.query(ORMFormationUser).filter(
                ORMFormationUser.type == 'interested')
            if training_id:
                q = q.filter(ORMFormationUser.training_id == training_id)
            rows = q.order_by(ORMFormationUser.enrolled_at.desc()).limit(limit).all()
            return [self._to_dict(r) for r in rows]

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
            'session_id': relation.session_id,
            'type': relation.type,
            'enrolled_at': isoformat(relation.enrolled_at),
            'completed_at': isoformat(relation.completed_at),
        }
