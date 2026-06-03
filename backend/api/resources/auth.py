"""Authentication endpoints: register, login, token refresh and logout."""

from flask import request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
)
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.api.state import BLOCKLIST
from backend.models.user import User as DomainUser
from backend.persistence.services import UserService


service = UserService()


class AuthRegisterResource(Resource):
    """Register a new user account.

    Validates the request body with the domain model before persisting.
    Returns the new user object along with access and refresh tokens.
    """

    def post(self):
        """Create a new user and return JWT tokens.

        Expected JSON body:
            email (str): Valid email address.
            password (str): Password (min 8 chars).
            first_name (str | None): Optional first name.

        Returns:
            tuple[dict, int]: ``{user, access_token, refresh_token}`` and 201.
        """
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        if not email or not password:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'email and password required', 400)
        try:
            DomainUser(email=email, password=password, first_name=first_name)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        try:
            user = service.register(email, password, first_name=first_name)
        except Exception as exc:
            return error_response(ERROR_CODES['CONFLICT'], 'could not create user', 409, str(exc))
        access_token = create_access_token(identity=user['id'])
        refresh_token = create_refresh_token(identity=user['id'])
        return {'user': user, 'access_token': access_token, 'refresh_token': refresh_token}, 201


class AuthLoginResource(Resource):
    """Authenticate a user and return JWT tokens."""

    def post(self):
        """Validate credentials and issue access/refresh tokens.

        Expected JSON body:
            email (str): Registered email address.
            password (str): Account password.

        Returns:
            tuple[dict, int]: ``{access_token, refresh_token, user}`` and 200.
        """
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'email and password required', 400)
        user = service.login(email, password)
        if not user:
            return error_response(ERROR_CODES['INVALID_CREDENTIALS'], 'invalid credentials', 401)
        token = create_access_token(identity=user['id'])
        refresh_token = create_refresh_token(identity=user['id'])
        return {'access_token': token, 'refresh_token': refresh_token, 'user': user}


class AuthRefreshResource(Resource):
    """Exchange a valid refresh token for a new access token."""

    @jwt_required(refresh=True)
    def post(self):
        """Issue a fresh access token using the provided refresh token.

        Returns:
            tuple[dict, int]: ``{access_token}`` and 200.
        """
        user_id = get_jwt_identity()
        return {'access_token': create_access_token(identity=user_id)}


class AuthLogoutResource(Resource):
    """Revoke the current JWT by adding its JTI to the in-memory blocklist."""

    @jwt_required()
    def post(self):
        """Add the current token's JTI to the blocklist.

        Returns:
            tuple[dict, int]: ``{msg}`` and 200.
        """
        jwt_data = get_jwt()
        BLOCKLIST.add(jwt_data['jti'])
        return {'msg': 'logged out'}
