"""Message-related API resources."""

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.models.message import Message as DomainMessage
from backend.persistence.services import ConversationService, MessageService


message_service = MessageService()
conversation_service = ConversationService()


class MessageListResource(Resource):
    """List messages, optionally filtered by conversation or author."""

    @jwt_required()
    def get(self):
        """Return messages with optional filters.

        Query parameters:
            conversation_id (str): Filter by conversation UUID.
            author_id (str): Filter by author UUID.
            limit (int): Max messages to return (default 100).

        Returns:
            tuple[dict, int]: ``{messages}`` and 200.
        """
        limit = request.args.get('limit', default=100, type=int)
        conversation_id = request.args.get('conversation_id')
        author_id = request.args.get('author_id')
        identity = get_jwt_identity()
        if conversation_id:
            if not conversation_service.facade.is_participant(conversation_id, identity):
                return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
            return {'messages': message_service.facade.list_by_conversation(
                conversation_id, limit=limit)}
        # Otherwise a user may only read messages they authored themselves.
        if author_id and author_id != identity:
            return error_response(ERROR_CODES['FORBIDDEN'], 'forbidden', 403)
        return {'messages': message_service.facade.list_by_author(identity, limit=limit)}


class MessageResource(Resource):
    """Delete a single message by id."""

    @jwt_required()
    def delete(self, message_id):
        """Permanently delete a message.

        Args:
            message_id (str): Message UUID path parameter.

        Returns:
            tuple[dict, int]: ``{msg}`` and 200, or 404.
        """
        message = message_service.facade.get(message_id)
        if not message:
            return error_response(ERROR_CODES['NOT_FOUND'], 'message not found', 404)
        if message.get('author_id') != get_jwt_identity():
            return error_response(ERROR_CODES['NOT_FOUND'], 'message not found', 404)
        if not message_service.facade.delete(message_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'message not found', 404)
        return {'msg': 'message deleted'}


class ConversationMessagesResource(Resource):
    """List or post messages within a specific conversation."""

    @jwt_required()
    def get(self, conversation_id):
        """Return messages for a conversation in chronological order.

        Args:
            conversation_id (str): Conversation UUID path parameter.

        Query parameters:
            limit (int): Max messages to return (default 100).

        Returns:
            tuple[dict, int]: ``{messages}`` and 200.
        """
        if not conversation_service.facade.is_participant(conversation_id, get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        limit = request.args.get('limit', default=100, type=int)
        return {'messages': message_service.facade.list_by_conversation(
            conversation_id, limit=limit)}

    @jwt_required()
    def post(self, conversation_id):
        """Create a message in a conversation.

        Args:
            conversation_id (str): Conversation UUID path parameter.

        Expected JSON body:
            content (str): Message text.
            recipient_id (str | None): Optional direct recipient UUID.
            author_id (str | None): Optional author UUID (defaults to the
                authenticated user).

        Returns:
            tuple[dict, int]: ``{message}`` and 201.
        """
        if not conversation_service.facade.is_participant(conversation_id, get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        data = request.get_json(silent=True) or {}
        content = data.get('content')
        try:
            dm = DomainMessage()
            dm.content = content
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        message = message_service.facade.create(
            author_id=get_jwt_identity(),
            content=content,
            recipient_id=data.get('recipient_id'),
            conversation_id=conversation_id,
        )
        return {'message': message}, 201
