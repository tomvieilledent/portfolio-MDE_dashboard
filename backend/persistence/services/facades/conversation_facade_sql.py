from datetime import datetime, timezone
from typing import Any

from backend.persistence.db import SessionLocal
from backend.persistence.models import Conversation as ORMConversation
from ._common_sql import from_csv, isoformat, session_scope, to_csv


class ConversationFacade:
    def __init__(self):
    pass

    def create(self, participant_ids=None, **kwargs):
        with session_scope() as db:
            conversation = ORMConversation(
                participant_ids=to_csv(participant_ids or []),
                is_active=kwargs.get('is_active', True),
                created_at=kwargs.get(
                    'created_at') or datetime.now(timezone.utc),
            )
            db.add(conversation)
            db.flush()
            db.refresh(conversation)
            return self._to_dict(conversation)

    def get(self, conversation_id):
        with session_scope() as db:
            conversation: Any = db.query(ORMConversation).filter(
                ORMConversation.id == conversation_id).first()
            return self._to_dict(conversation) if conversation else None

    def list(self, limit=100):
        with session_scope() as db:
            rows = db.query(ORMConversation).order_by(
                ORMConversation.created_at.desc()).limit(limit).all()
            return [self._to_dict(row) for row in rows]

    def add_participant(self, conversation_id, user_id):
        with session_scope() as db:
            conversation: Any = db.query(ORMConversation).filter(
                ORMConversation.id == conversation_id).first()
            if not conversation:
                return None
            participants = from_csv(conversation.participant_ids)
            if user_id not in participants:
                participants.append(user_id)
                conversation.participant_ids = to_csv(participants)
            db.add(conversation)
            db.flush()
            db.refresh(conversation)
            return self._to_dict(conversation)

    def remove_participant(self, conversation_id, user_id):
        with session_scope() as db:
            conversation: Any = db.query(ORMConversation).filter(
                ORMConversation.id == conversation_id).first()
            if not conversation:
                return None
            participants = from_csv(conversation.participant_ids)
            participants = [item for item in participants if item != user_id]
            conversation.participant_ids = to_csv(participants)
            db.add(conversation)
            db.flush()
            db.refresh(conversation)
            return self._to_dict(conversation)

    def deactivate(self, conversation_id):
        with session_scope() as db:
            conversation: Any = db.query(ORMConversation).filter(
                ORMConversation.id == conversation_id).first()
            if not conversation:
                return False
            conversation.is_active = False
            db.add(conversation)
            return True

    def _to_dict(self, conversation):
        return {
            'id': conversation.id,
            'participant_ids': from_csv(conversation.participant_ids),
            'is_active': conversation.is_active,
            'created_at': isoformat(conversation.created_at),
        }
