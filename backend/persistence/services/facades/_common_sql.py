from contextlib import contextmanager
from datetime import datetime
from typing import Any

from backend.persistence.db import SessionLocal


@contextmanager
def session_scope():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def isoformat(value: Any):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def normalize_text(value):
    if value is None:
        return None
    return value.strip() if isinstance(value, str) else value


def to_csv(values):
    if not values:
        return None
    return ",".join(str(item).strip() for item in values if str(item).strip())


def from_csv(value):
    if not value:
        return []
    return [item for item in value.split(",") if item]
