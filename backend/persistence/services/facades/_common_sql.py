"""Small SQL helper utilities used by the persistence facades.

This module contains a context manager for scoped sessions and a few
helpers to normalize and serialize values for the database layer.
"""

from contextlib import contextmanager
from datetime import datetime
from typing import Any, Iterable, List, Optional

from backend.persistence.db import SessionLocal


@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations.

    Yields
    ------
    sqlalchemy.orm.Session
        A session bound to the configured engine. The session is committed
        if the context exits normally and rolled back on exception.
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def isoformat(value: Any) -> Optional[str]:
    """Return an ISO8601 string for datetimes, pass-through otherwise.

    Parameters
    ----------
    value : Any
        Value to convert. If it's a `datetime` the ISO formatted string is
        returned; `None` returns `None`.
    """
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def normalize_text(value: Optional[str]) -> Optional[str]:
    """Strip a string value or return `None` when input is `None`.

    Keeps non-string values unchanged.
    """
    if value is None:
        return None
    return value.strip() if isinstance(value, str) else value


def to_csv(values: Optional[Iterable]) -> Optional[str]:
    """Serialize an iterable of values to a comma-separated string.

    Empty input returns `None`.
    """
    if not values:
        return None
    return ",".join(str(item).strip() for item in values if str(item).strip())


def from_csv(value: Optional[str]) -> List[str]:
    """Parse a comma-separated string back to a list of non-empty items.

    Returns an empty list for falsy input.
    """
    if not value:
        return []
    return [item for item in value.split(",") if item]
