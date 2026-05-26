from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt import jwt_required
from backend.persistence.services import ConversationService


conversation_service = ConversationService()


class ConversationListResource(Resource):
    @jwt_required()
    def get(self):
        limit = request.args.get('limit', default=100, type=int)
        return {'conversations': conversation_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        data = request.get_json(silent=True) or {}
        conversation = conversation_service.facade.create(
            participant_ids=data.get('participant_ids'))
        return {'conversation': conversation}, 201


class ConversationResource(Resource):
    @jwt_required()
    def get(self, conversation_id):
        conversation = conversation_service.facade.get(conversation_id)
        if not conversation:
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        return {'conversation': conversation}

    @jwt_required()
    def patch(self, conversation_id):
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
        if not conversation_service.facade.deactivate(conversation_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'conversation not found', 404)
        return {'msg': 'conversation deactivated'}
