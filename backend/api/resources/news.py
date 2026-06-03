"""News endpoints for listing, creating and syncing news items."""

from flask import request
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.models.news import News as DomainNews
from backend.persistence.services import NewsService


news_service = NewsService()


class NewsListResource(Resource):
    """List news items or create a new one."""

    def get(self):
        """Return a paginated list of news items.

        Query parameters:
            limit (int): Max items to return (default 100).

        Returns:
            tuple[dict, int]: ``{news}`` and 200.
        """
        limit = request.args.get('limit', default=100, type=int)
        return {'news': news_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        """Create a news item.

        Expected JSON body:
            title (str): Article headline (required).
            source (str | None): Publisher name.
            summary (str | None): Short summary.
            url (str | None): Link to original article.
            published_at (str | None): ISO 8601 publication datetime.

        Returns:
            tuple[dict, int]: ``{news_item}`` and 201.
        """
        data = request.get_json(silent=True) or {}
        title = data.get('title')
        if not title:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'title is required', 400)
        try:
            DomainNews(title=title)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        article = news_service.facade.create(
            title,
            source=data.get('source'),
            summary=data.get('summary'),
            url=data.get('url'),
            published_at=data.get('published_at'),
        )
        return {'news_item': article}, 201


class NewsResource(Resource):
    """Retrieve or delete a single news item."""

    def get(self, news_id):
        """Return a news item by id.

        Args:
            news_id (str): News UUID path parameter.

        Returns:
            tuple[dict, int]: ``{news_item}`` and 200, or 404.
        """
        article = news_service.facade.get(news_id)
        if not article:
            return error_response(ERROR_CODES['NOT_FOUND'], 'news item not found', 404)
        return {'news_item': article}

    @jwt_required()
    def delete(self, news_id):
        """Permanently delete a news item.

        Args:
            news_id (str): News UUID path parameter.

        Returns:
            tuple[dict, int]: ``{msg}`` and 200, or 404.
        """
        if not news_service.facade.delete(news_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'news item not found', 404)
        return {'msg': 'news item deleted'}


class NewsSyncResource(Resource):
    """Placeholder for syncing external news sources."""

    @jwt_required()
    def post(self):
        """Not implemented: sync external news into the database.

        Returns:
            tuple[dict, int]: 501 error response.
        """
        return error_response(ERROR_CODES['NOT_IMPLEMENTED'],
                              'news sync is not configured yet', 501)
