"""Endpoints for managing formation-user relations (enrollments)."""

from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt import jwt_required
from backend.persistence.services import FormationUserService


formation_service = FormationUserService()


class FormationUserListResource(Resource):
    """List or create formation-user relations (enrollments)."""

    @jwt_required()
    def get(self):
        """Return a paginated list of enrollments."""
        limit = request.args.get('limit', default=100, type=int)
        return {'formation_users': formation_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        """Create an enrollment linking `user_id` and `training_id`.

        Expects JSON body with `user_id` and `training_id`.
        """
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id')
        training_id = data.get('training_id')
        if not user_id or not training_id:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'user_id and training_id are required', 400)
        relation = formation_service.facade.create(
            user_id,
            training_id,
            status=data.get('status'),
            progress=data.get('progress'),
        )
        return {'formation_user': relation}, 201


class FormationUserResource(Resource):
    """Retrieve, update or delete a specific enrollment."""

    @jwt_required()
    def get(self, relation_id):
        """Return an enrollment by id."""
        relation = formation_service.facade.get(relation_id)
        if not relation:
            return error_response(ERROR_CODES['NOT_FOUND'], 'enrollment not found', 404)
        return {'formation_user': relation}

    @jwt_required()
    def patch(self, relation_id):
        """Update enrollment fields (status/progress)."""
        data = request.get_json(silent=True) or {}
        relation = formation_service.facade.update(relation_id, **data)
        if not relation:
            return error_response(ERROR_CODES['NOT_FOUND'], 'enrollment not found', 404)
        return {'formation_user': relation}

    @jwt_required()
    def delete(self, relation_id):
        """Delete an enrollment by id."""
        if not formation_service.facade.delete(relation_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'enrollment not found', 404)
        return {'msg': 'enrollment deleted'}
