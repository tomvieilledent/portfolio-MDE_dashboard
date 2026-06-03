"""News persistence facade (SQLAlchemy)."""

from datetime import datetime, timezone
from typing import Any

from backend.persistence.models import News as ORMNews
from ._common_sql import isoformat, normalize_text, session_scope


class NewsFacade:
    """SQLAlchemy-backed facade for news item CRUD operations."""

    def create(self, title, source=None, summary=None, url=None,
               published_at=None, **kwargs):
        """Persist a new news item.

        Args:
            title (str): Article headline (stripped before storage).
            source (str | None): Publisher name.
            summary (str | None): Short article summary.
            url (str | None): Link to the original article.
            published_at (datetime | None): Original publication datetime.
            **kwargs: Optional ``created_at`` datetime override.

        Returns:
            dict: Newly created news item as a serialisable dict.
        """
        with session_scope() as db:
            news = ORMNews(
                title=normalize_text(title),
                source=normalize_text(source),
                summary=normalize_text(summary),
                url=normalize_text(url),
                published_at=published_at,
                created_at=kwargs.get('created_at') or datetime.now(timezone.utc),
            )
            db.add(news)
            db.flush()
            db.refresh(news)
            return self._to_dict(news)

    def get(self, news_id):
        """Retrieve a news item by primary key.

        Args:
            news_id (str): News UUID.

        Returns:
            dict | None: News dict, or ``None`` if not found.
        """
        with session_scope() as db:
            news: Any = db.query(ORMNews).filter(ORMNews.id == news_id).first()
            return self._to_dict(news) if news else None

    def list(self, limit=100):
        """Return news items ordered by creation date (newest first).

        Args:
            limit (int): Maximum number of rows. Defaults to 100.

        Returns:
            list[dict]: Serialised news item dicts.
        """
        with session_scope() as db:
            rows = db.query(ORMNews).order_by(
                ORMNews.created_at.desc()).limit(limit).all()
            return [self._to_dict(row) for row in rows]

    def delete(self, news_id):
        """Permanently delete a news item.

        Args:
            news_id (str): News UUID.

        Returns:
            bool: ``True`` when deleted, ``False`` when not found.
        """
        with session_scope() as db:
            news: Any = db.query(ORMNews).filter(ORMNews.id == news_id).first()
            if not news:
                return False
            db.delete(news)
            return True

    def _to_dict(self, news):
        return {
            'id': news.id,
            'title': news.title,
            'source': news.source,
            'summary': news.summary,
            'url': news.url,
            'published_at': isoformat(news.published_at),
            'created_at': isoformat(news.created_at),
            'updated_at': isoformat(getattr(news, 'updated_at', None)),
            'deactivate_by': getattr(news, 'deactivate_by', None),
            'delete_by': getattr(news, 'delete_by', None),
            'uploaded_at': isoformat(getattr(news, 'uploaded_at', None)),
        }
