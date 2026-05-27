"""News persistence facade for ingesting and listing news items."""

from datetime import datetime, timezone
from typing import Any

from backend.persistence.models import News as ORMNews
from ._common_sql import isoformat, normalize_text, session_scope


class NewsFacade:
    """Facade handling CRUD operations for news items."""

    def __init__(self):
        pass

    def create(self, title, source=None, summary=None, url=None, published_at=None, **kwargs):
        with session_scope() as db:
            news = ORMNews(
                title=normalize_text(title),
                source=normalize_text(source),
                summary=normalize_text(summary),
                url=normalize_text(url),
                published_at=published_at,
                created_at=kwargs.get(
                    'created_at') or datetime.now(timezone.utc),
            )
            db.add(news)
            db.flush()
            db.refresh(news)
            return self._to_dict(news)

    def get(self, news_id):
        with session_scope() as db:
            news: Any = db.query(ORMNews).filter(ORMNews.id == news_id).first()
            return self._to_dict(news) if news else None

    def list(self, limit=100):
        with session_scope() as db:
            rows = db.query(ORMNews).order_by(
                ORMNews.created_at.desc()).limit(limit).all()
            return [self._to_dict(row) for row in rows]

    def delete(self, news_id):
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
