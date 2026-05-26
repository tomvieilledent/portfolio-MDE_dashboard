from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt import jwt_required
from backend.persistence.services import NewsService


news_service = NewsService()


class NewsListResource(Resource):
    def get(self):
        limit = request.args.get('limit', default=100, type=int)
        return {'news': news_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        data = request.get_json(silent=True) or {}
        title = data.get('title')
        if not title:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'title is required', 400)
        article = news_service.facade.create(
            title,
            source=data.get('source'),
            summary=data.get('summary'),
            url=data.get('url'),
            published_at=data.get('published_at'),
        )
        return {'news_item': article}, 201


class NewsResource(Resource):
    def get(self, news_id):
        article = news_service.facade.get(news_id)
        if not article:
            return error_response(ERROR_CODES['NOT_FOUND'], 'news item not found', 404)
        return {'news_item': article}

    @jwt_required()
    def delete(self, news_id):
        if not news_service.facade.delete(news_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'news item not found', 404)
        return {'msg': 'news item deleted'}


class NewsSyncResource(Resource):
    @jwt_required()
    def post(self):
        return error_response(ERROR_CODES['NOT_IMPLEMENTED'], 'news sync is not configured yet', 501)
