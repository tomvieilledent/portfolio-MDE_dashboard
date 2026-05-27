"""Notification API resources.

List, create, mark read, and delete user notifications.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt import jwt_required
from backend.persistence.services import NotificationService
from backend.models.notification import Notification as DomainNotification


notification_service = NotificationService()


class NotificationListResource(Resource):
    """List or create notifications.

    GET supports query parameters `recipient_id`, `is_read`, `limit`.
    POST requires `recipient_id` and `content` fields.
    """

    @jwt_required()
    def get(self):
        """Return notifications for a recipient (defaults to current user)."""
        limit = request.args.get('limit', default=100, type=int)
        recipient_id = request.args.get('recipient_id') or get_jwt_identity()
        is_read = request.args.get('is_read')
        if recipient_id:
            notifications = notification_service.facade.list_by_recipient(
                recipient_id, limit=limit)
            if is_read in ('true', 'false'):
                want_read = is_read == 'true'
                notifications = [
                    item for item in notifications if item['is_read'] == want_read]
            return {'notifications': notifications}
        return {'notifications': notification_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        """Create a notification.

        JSON body must include `recipient_id` and `content`.
        """
        data = request.get_json(silent=True) or {}
        recipient_id = data.get('recipient_id')
        content = data.get('content')
        if not recipient_id or not content:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'recipient_id and content are required', 400)
        try:
            notification = DomainNotification()
            notification.content = content
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        notification = notification_service.facade.create(
            recipient_id, content, is_read=data.get('is_read', False))
        return {'notification': notification}, 201


class NotificationResource(Resource):
    """Retrieve and modify a single notification."""

    @jwt_required()
    def patch(self, notification_id):
        """Mark a notification as read (expects `is_read: true`)."""
        data = request.get_json(silent=True) or {}
        if data.get('is_read') is True:
            if not notification_service.facade.mark_read(notification_id):
                return error_response(ERROR_CODES['NOT_FOUND'], 'notification not found', 404)
            notification = notification_service.facade.get(notification_id)
            return {'notification': notification}
        return error_response(ERROR_CODES['BAD_REQUEST'], 'nothing to update', 400)

    @jwt_required()
    def delete(self, notification_id):
        """Delete a notification by id."""
        if not notification_service.facade.delete(notification_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'notification not found', 404)
        return {'msg': 'notification deleted'}
