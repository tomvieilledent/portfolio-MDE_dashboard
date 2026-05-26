from datetime import datetime, timezone
from typing import Any

from backend.persistence.db import SessionLocal
from backend.persistence.models import Notification as ORMNotification
from ._common_sql import isoformat, session_scope


class NotificationFacade:
    def __init__(self):
    pass

    def create(self, recipient_id, content, is_read=False, **kwargs):
        with session_scope() as db:
            notification = ORMNotification(
                recipient_id=recipient_id,
                content=content.strip(),
                is_read=is_read,
                created_at=kwargs.get(
                    'created_at') or datetime.now(timezone.utc),
            )
            db.add(notification)
            db.flush()
            db.refresh(notification)
            return self._to_dict(notification)

    def get(self, notification_id):
        with session_scope() as db:
            notification: Any = db.query(ORMNotification).filter(
                ORMNotification.id == notification_id).first()
            return self._to_dict(notification) if notification else None

    def list(self, limit=100):
        with session_scope() as db:
            rows = db.query(ORMNotification).order_by(
                ORMNotification.created_at.desc()).limit(limit).all()
            return [self._to_dict(row) for row in rows]

    def list_by_recipient(self, recipient_id, limit=100):
        with session_scope() as db:
            rows = (
                db.query(ORMNotification)
                .filter(ORMNotification.recipient_id == recipient_id)
                .order_by(ORMNotification.created_at.desc())
                .limit(limit)
                .all()
            )
            return [self._to_dict(row) for row in rows]

    def mark_read(self, notification_id):
        with session_scope() as db:
            notification: Any = db.query(ORMNotification).filter(
                ORMNotification.id == notification_id).first()
            if not notification:
                return False
            notification.is_read = True
            db.add(notification)
            return True

    def delete(self, notification_id):
        with session_scope() as db:
            notification: Any = db.query(ORMNotification).filter(
                ORMNotification.id == notification_id).first()
            if not notification:
                return False
            db.delete(notification)
            return True

    def _to_dict(self, notification):
        return {
            'id': notification.id,
            'recipient_id': notification.recipient_id,
            'content': notification.content,
            'is_read': notification.is_read,
            'created_at': isoformat(notification.created_at),
        }
