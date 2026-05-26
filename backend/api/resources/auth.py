from flask_restful import Resource
from flask import request
from backend.persistence.services import UserService
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, get_jwt_identity, jwt_required
from backend.models.user import User as DomainUser
from backend.api.errors import ERROR_CODES, error_response
from backend.api.state import BLOCKLIST
from backend.api.jwt import jwt_required


service = UserService()


class AuthRegisterResource(Resource):
    def post(self):
        data = request.get_json() or {}
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        if not email or not password:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'email and password required', 400)
        # Validate using domain model
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
    def post(self):
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
    @jwt_required(refresh=True)
    def post(self):
        user_id = get_jwt_identity()
        return {'access_token': create_access_token(identity=user_id)}


class AuthLogoutResource(Resource):
    @jwt_required()
    def post(self):
        jwt_data = get_jwt()
        BLOCKLIST.add(jwt_data['jti'])
        return {'msg': 'logged out'}
