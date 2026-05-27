"""User-related API resources.

Includes listing, creation, retrieval, update, and password reset endpoints.
"""

from flask_restful import Resource
from flask import request
from backend.persistence.services import UserService
from flask_jwt_extended import get_jwt_identity
from typing import Any
from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt import jwt_required


service = UserService()


class UserListResource(Resource):
    """List users or create a new user.

    get()
        Optionally filter by `company_id` and limit results.
    post()
        Create a new user (email and password required).
    """

    @jwt_required()
    def get(self):
        """Return list of users; optional `company_id` filter."""
        limit = request.args.get('limit', default=100, type=int)
        company_id = request.args.get('company_id')
        if company_id:
            return {'users': service.list_users_by_company(company_id, limit=limit)}
        return {'users': service.list_users(limit=limit)}

    @jwt_required()
    def post(self):
        """Create a user from JSON body (email, password, first_name)."""
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        if not email or not password:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'email and password required', 400)
        try:
            user = service.register(email, password, first_name=first_name)
        except Exception as exc:
            return error_response(ERROR_CODES['CONFLICT'], 'could not create user', 409, str(exc))
        return {'user': user}, 201


class UserMeResource(Resource):
    """Operations on the current authenticated user."""

    @jwt_required()
    def get(self):
        """Return current user profile."""
        user = service.get_by_id(get_jwt_identity())
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': user}

    @jwt_required()
    def patch(self):
        """Partially update current user using provided JSON body."""
        data = request.get_json(silent=True) or {}
        user = service.update(get_jwt_identity(), **data)
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': user}


class UserResource(Resource):
    """Operations for a specific user identified by `user_id`."""

    @jwt_required()
    def get(self, user_id):
        """Retrieve a user by id."""
        u = service.get_by_id(user_id)
        if not u:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': u}

    @jwt_required()
    def put(self, user_id):
        """Replace name fields for the user."""
        data = request.get_json() or {}
        first_name: Any = data.get('first_name')
        last_name: Any = data.get('last_name')
        user = service.update(
            user_id, first_name=first_name, last_name=last_name)
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': user}

    @jwt_required()
    def patch(self, user_id):
        """Partial update for the user using provided JSON body."""
        data = request.get_json(silent=True) or {}
        user = service.update(user_id, **data)
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': user}

    @jwt_required()
    def delete(self, user_id):
        """Permanently delete a user by id."""
        ok = service.delete(user_id)
        if not ok:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'msg': 'user deleted'}


class UserDeactivateResource(Resource):
    """Deactivate a user without deleting the row."""

    @jwt_required()
    def patch(self, user_id):
        """Soft-deactivate a user by id."""
        ok = service.deactivate(user_id, by='api')
        if not ok:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'msg': 'deactivated'}


class UserResetPasswordResource(Resource):
    """Endpoint to reset a user's password."""

    @jwt_required()
    def post(self, user_id):
        """Set a new password for the user.

        JSON body should include `password`.
        """
        data = request.get_json(silent=True) or {}
        password = data.get('password')
        if not password:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'password is required', 400)
        if not service.reset_password(user_id, password):
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'msg': 'password updated'}
