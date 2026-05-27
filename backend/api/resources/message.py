"""Message-related API resources.

List, create and delete messages; also list/create messages for a specific
conversation.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.persistence.services import MessageService
from backend.models.message import Message as DomainMessage


message_service = MessageService()


class MessageListResource(Resource):
    """List messages, optionally filtered by conversation or author."""

    @jwt_required()
    def get(self):
        """Return messages. Query parameters: `conversation_id`, `author_id`, `limit`."""
        limit = request.args.get('limit', default=100, type=int)
        conversation_id = request.args.get('conversation_id')
        author_id = request.args.get('author_id')
        if conversation_id:
            return {'messages': message_service.facade.list_by_conversation(conversation_id, limit=limit)}
        if author_id:
            return {'messages': message_service.facade.list_by_author(author_id, limit=limit)}
        return {'messages': message_service.facade.list(limit=limit)}


class MessageResource(Resource):
    """Endpoint to delete a single message by id."""

    @jwt_required()
    def delete(self, message_id):
        """Delete a message; returns 404 if not found."""
        if not message_service.facade.delete(message_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'message not found', 404)
        return {'msg': 'message deleted'}


class ConversationMessagesResource(Resource):
    """List or post messages within a conversation."""

    @jwt_required()
    def get(self, conversation_id):
        """List messages for a conversation, paginated by `limit`."""
        limit = request.args.get('limit', default=100, type=int)
        return {'messages': message_service.facade.list_by_conversation(conversation_id, limit=limit)}

    @jwt_required()
    def post(self, conversation_id):
        """Create a message in the conversation.

        JSON body: `content` (required), optional `recipient_id` and `author_id`.
        """
        data = request.get_json(silent=True) or {}
        content = data.get('content')
        # validate content using domain model
        try:
            dm = DomainMessage()
            dm.content = content
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        message = message_service.facade.create(
            author_id=data.get('author_id') or get_jwt_identity(),
            content=content,
            recipient_id=data.get('recipient_id'),
            conversation_id=conversation_id,
        )
        return {'message': message}, 201
