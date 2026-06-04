"""News persistence facade (SQLAlchemy)."""

from datetime import datetime, timezone
from typing import Any

from backend.persistence.models import News as ORMNews
from ._common_sql import isoformat, normalize_text, session_scope


class NewsFacade:
    """SQLAlchemy-backed facade for news item CRUD operations."""

    def create(self, title, source=None, summary=None, url=None,
               published_at=None, category=None, **kwargs):
        with session_scope() as db:
            news = ORMNews(
                title=normalize_text(title),
                source=normalize_text(source),
                summary=normalize_text(summary),
                url=normalize_text(url),
                category=normalize_text(category),
                published_at=published_at,
                created_at=kwargs.get('created_at') or datetime.now(timezone.utc),
            )
            db.add(news)
            db.flush()
            db.refresh(news)
            return self._to_dict(news)

    def get(self, news_id):
        with session_scope() as db:
            news: Any = db.query(ORMNews).filter(ORMNews.id == news_id).first()
            return self._to_dict(news) if news else None

    def list(self, limit=100, category=None, source=None):
        with session_scope() as db:
            q = db.query(ORMNews)
            if category:
                q = q.filter(ORMNews.category == category)
            if source:
                q = q.filter(ORMNews.source == source)
            rows = q.order_by(ORMNews.created_at.desc()).limit(limit).all()
            return [self._to_dict(row) for row in rows]

    def url_exists(self, url):
        if not url:
            return False
        with session_scope() as db:
            return db.query(ORMNews).filter(ORMNews.url == url).first() is not None

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
            'category': getattr(news, 'category', None),
            'published_at': isoformat(news.published_at),
            'created_at': isoformat(news.created_at),
        }
