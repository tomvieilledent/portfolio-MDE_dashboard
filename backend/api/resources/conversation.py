"""API resources for conversations (rooms).

Provides endpoints to list, create, update and deactivate conversations.

Google-style docstrings are used for classes and methods.
"""

from flask import request
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt import jwt_required
from backend.persistence.services import ConversationService


conversation_service = ConversationService()


class ConversationListResource(Resource):
    """Resource for listing and creating conversations.

    Methods
    -------
    get()
        Return a list of conversations, paginated by `limit`.
    post()
        Create a new conversation with provided `participant_ids`.
    """

    @jwt_required()
    def get(self):
        """Return a list of conversations.

        Query parameters
        ----------------
        limit: int
            Maximum number of conversations to return (default 100).
        """
        limit = request.args.get('limit', default=100, type=int)
        return {'conversations': conversation_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        """Create a conversation.

        JSON body
        ---------
        participant_ids: list[str]
            Optional list of participant ids for the new conversation.
        """
        data = request.get_json(silent=True) or {}
        conversation = conversation_service.facade.create(
            participant_ids=data.get('participant_ids'))
        return {'conversation': conversation}, 201


class ConversationResource(Resource):
    """Resource for operations on a single conversation.

    Methods
    -------
    get(conversation_id)
        Retrieve a conversation by id.
    patch(conversation_id)
        Add or remove participants from the conversation.
    delete(conversation_id)
        Soft-deactivate the conversation.
    """

    @jwt_required()
    def get(self, conversation_id):
        """Get a conversation by id.

        Returns 404 if not found.
        """
        conversation = conversation_service.facade.get(conversation_id)
        if not conversation:
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        return {'conversation': conversation}

    @jwt_required()
    def patch(self, conversation_id):
        """Modify participants of the conversation.

        Expected JSON body: {"participant_id": str, "action": "add"|"remove"}.
        Returns 404 if conversation not found.
        """
        data = request.get_json(silent=True) or {}
        if 'participant_id' in data and data.get('action') == 'add':
            conversation = conversation_service.facade.add_participant(
                conversation_id, data.get('participant_id'))
        elif 'participant_id' in data and data.get('action') == 'remove':
            conversation = conversation_service.facade.remove_participant(
                conversation_id, data.get('participant_id'))
        else:
            conversation = None
        if not conversation:
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        return {'conversation': conversation}

    @jwt_required()
    def delete(self, conversation_id):
        """Soft-deactivate a conversation.

        Returns 404 if the conversation does not exist.
        """
        if not conversation_service.facade.deactivate(conversation_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        return {'msg': 'conversation deactivated'}
