"""API resources for conversations (chat rooms)."""

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.models.conversation import Conversation as DomainConversation
from backend.persistence.services import ConversationService


conversation_service = ConversationService()


class ConversationListResource(Resource):
    """List or create conversations."""

    @jwt_required()
    def get(self):
        """Return a list of conversations.

        Query parameters:
            limit (int): Max conversations to return (default 100).

        Returns:
            tuple[dict, int]: ``{conversations}`` and 200.
        """
        limit = request.args.get('limit', default=100, type=int)
        return {'conversations': conversation_service.facade.list_by_participant(
            get_jwt_identity(), limit=limit)}

    @jwt_required()
    def post(self):
        """Create a new conversation.

        Expected JSON body:
            participant_ids (list[str] | None): Initial participant UUIDs.

        Returns:
            tuple[dict, int]: ``{conversation}`` and 201.
        """
        data = request.get_json(silent=True) or {}
        participant_ids = data.get('participant_ids') or []
        try:
            DomainConversation(participant_ids=participant_ids)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        # Always include the creator so they don't lock themselves out.
        identity = get_jwt_identity()
        if identity not in participant_ids:
            participant_ids = [identity, *participant_ids]
        conversation = conversation_service.facade.create(
            participant_ids=participant_ids)
        return {'conversation': conversation}, 201


class ConversationResource(Resource):
    """Retrieve, update or deactivate a single conversation."""

    @jwt_required()
    def get(self, conversation_id):
        """Return a conversation by id.

        Args:
            conversation_id (str): Conversation UUID path parameter.

        Returns:
            tuple[dict, int]: ``{conversation}`` and 200, or 404.
        """
        conversation = conversation_service.facade.get(conversation_id)
        if not conversation:
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        if not conversation_service.facade.is_participant(conversation_id, get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        return {'conversation': conversation}

    @jwt_required()
    def patch(self, conversation_id):
        """Add or remove a participant from a conversation.

        Args:
            conversation_id (str): Conversation UUID path parameter.

        Expected JSON body:
            participant_id (str): User UUID to add or remove.
            action (str): ``"add"`` or ``"remove"``.

        Returns:
            tuple[dict, int]: ``{conversation}`` and 200, or 404.
        """
        if not conversation_service.facade.is_participant(conversation_id, get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        data = request.get_json(silent=True) or {}
        participant_id = data.get('participant_id')
        if participant_id is not None:
            if not isinstance(participant_id, str):
                return error_response(ERROR_CODES['VALIDATION_ERROR'],
                                      'participant_id must be a string', 400)
            participant_id = participant_id.strip()

        if participant_id and data.get('action') == 'add':
            conversation = conversation_service.facade.add_participant(
                conversation_id, participant_id)
        elif participant_id and data.get('action') == 'remove':
            conversation = conversation_service.facade.remove_participant(
                conversation_id, participant_id)
        else:
            conversation = None
        if not conversation:
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        return {'conversation': conversation}

    @jwt_required()
    def delete(self, conversation_id):
        """Soft-deactivate a conversation.

        Args:
            conversation_id (str): Conversation UUID path parameter.

        Returns:
            tuple[dict, int]: ``{msg}`` and 200, or 404.
        """
        if not conversation_service.facade.is_participant(conversation_id, get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        if not conversation_service.facade.deactivate(conversation_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        return {'msg': 'conversation deactivated'}
