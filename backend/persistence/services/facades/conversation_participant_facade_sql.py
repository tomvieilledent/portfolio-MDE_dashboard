"""Facade for conversation participant associations.

Provides simple CRUD operations for the `ConversationParticipant` table.
"""

from datetime import datetime, timezone
from typing import Any

from backend.persistence.models import ConversationParticipant as ORMConversationParticipant
from ._common_sql import isoformat, session_scope


class ConversationParticipantFacade:
    """Manage participant rows linking users to conversations."""

    def __init__(self):
        pass

    def create(self, conversation_id, user_id, **kwargs):
        with session_scope() as db:
            participant = ORMConversationParticipant(
                conversation_id=conversation_id,
                user_id=user_id,
                created_at=kwargs.get(
                    'created_at') or datetime.now(timezone.utc),
            )
            db.add(participant)
            db.flush()
            db.refresh(participant)
            return self._to_dict(participant)

    def get(self, participant_id):
        with session_scope() as db:
            participant: Any = db.query(ORMConversationParticipant).filter(
                ORMConversationParticipant.id == participant_id).first()
            return self._to_dict(participant) if participant else None

    def list(self, limit=100):
        with session_scope() as db:
            rows = db.query(ORMConversationParticipant).order_by(
                ORMConversationParticipant.created_at.desc()).limit(limit).all()
            return [self._to_dict(row) for row in rows]

    def list_by_conversation(self, conversation_id, limit=100):
        with session_scope() as db:
            rows = (
                db.query(ORMConversationParticipant)
                .filter(ORMConversationParticipant.conversation_id == conversation_id)
                .order_by(ORMConversationParticipant.created_at.asc())
                .limit(limit)
                .all()
            )
            return [self._to_dict(row) for row in rows]

    def delete(self, participant_id):
        with session_scope() as db:
            participant: Any = db.query(ORMConversationParticipant).filter(
                ORMConversationParticipant.id == participant_id).first()
            if not participant:
                return False
            db.delete(participant)
            return True

    def _to_dict(self, participant):
        return {
            'id': participant.id,
            'conversation_id': participant.conversation_id,
            'user_id': participant.user_id,
            'created_at': isoformat(participant.created_at),
            'uploaded_at': isoformat(getattr(participant, 'uploaded_at', None)),
            'updated_at': isoformat(getattr(participant, 'updated_at', None)),
            'deactivate_by': getattr(participant, 'deactivate_by', None),
            'delete_by': getattr(participant, 'delete_by', None),
        }
