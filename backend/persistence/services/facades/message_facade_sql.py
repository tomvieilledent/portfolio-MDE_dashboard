"""Message persistence facade (SQLAlchemy)."""

from datetime import datetime, timezone
from typing import Any

from backend.persistence.db import SessionLocal
from backend.persistence.models import Message as ORMMessage
from ._common_sql import isoformat, normalize_text, session_scope


class MessageFacade:
    """SQLAlchemy-backed facade for message CRUD operations.

    All public methods return plain dicts suitable for JSON serialisation.
    """

    def create(self, author_id, content, recipient_id=None, conversation_id=None, **kwargs):
        """Persist a new message.

        Args:
            author_id (str): UUID of the message author.
            content (str): Message body text.
            recipient_id (str | None): Optional direct recipient UUID.
            conversation_id (str | None): Optional conversation UUID.
            **kwargs: Optional ``created_at`` datetime override.

        Returns:
            dict: Newly created message as a serialisable dict.
        """
        with session_scope() as db:
            message = ORMMessage(
                author_id=author_id,
                recipient_id=recipient_id,
                conversation_id=conversation_id,
                content=normalize_text(content),
                created_at=kwargs.get('created_at') or datetime.now(timezone.utc),
            )
            db.add(message)
            db.flush()
            db.refresh(message)
            return self._to_dict(message)

    def get(self, message_id):
        """Retrieve a message by primary key.

        Args:
            message_id (str): Message UUID.

        Returns:
            dict | None: Message dict, or ``None`` if not found.
        """
        with session_scope() as db:
            message: Any = db.query(ORMMessage).filter(
                ORMMessage.id == message_id).first()
            return self._to_dict(message) if message else None

    def list(self, limit=100):
        """Return the most recent messages across all conversations.

        Args:
            limit (int): Maximum number of rows. Defaults to 100.

        Returns:
            list[dict]: Serialised message dicts, newest first.
        """
        with session_scope() as db:
            rows = db.query(ORMMessage).order_by(
                ORMMessage.created_at.desc()).limit(limit).all()
            return [self._to_dict(row) for row in rows]

    def list_by_conversation(self, conversation_id, limit=100):
        """Return messages for a specific conversation in chronological order.

        Args:
            conversation_id (str): Conversation UUID.
            limit (int): Maximum number of rows. Defaults to 100.

        Returns:
            list[dict]: Serialised message dicts, oldest first.
        """
        with session_scope() as db:
            rows = (
                db.query(ORMMessage)
                .filter(ORMMessage.conversation_id == conversation_id)
                .order_by(ORMMessage.created_at.asc())
                .limit(limit)
                .all()
            )
            return [self._to_dict(row) for row in rows]

    def list_by_author(self, author_id, limit=100):
        """Return messages sent by a specific author.

        Args:
            author_id (str): Author UUID.
            limit (int): Maximum number of rows. Defaults to 100.

        Returns:
            list[dict]: Serialised message dicts, newest first.
        """
        with session_scope() as db:
            rows = (
                db.query(ORMMessage)
                .filter(ORMMessage.author_id == author_id)
                .order_by(ORMMessage.created_at.desc())
                .limit(limit)
                .all()
            )
            return [self._to_dict(row) for row in rows]

    def delete(self, message_id):
        """Permanently delete a message row.

        Args:
            message_id (str): Message UUID.

        Returns:
            bool: ``True`` when deleted, ``False`` when not found.
        """
        with session_scope() as db:
            message: Any = db.query(ORMMessage).filter(
                ORMMessage.id == message_id).first()
            if not message:
                return False
            db.delete(message)
            return True

    def _to_dict(self, message):
        return {
            'id': message.id,
            'author_id': message.author_id,
            'recipient_id': message.recipient_id,
            'conversation_id': message.conversation_id,
            'content': message.content,
            'created_at': isoformat(message.created_at),
            'updated_at': isoformat(getattr(message, 'updated_at', None)),
            'deactivate_by': getattr(message, 'deactivate_by', None),
            'delete_by': getattr(message, 'delete_by', None),
            'uploaded_at': isoformat(getattr(message, 'uploaded_at', None)),
        }
