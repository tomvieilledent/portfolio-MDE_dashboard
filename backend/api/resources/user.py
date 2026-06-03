"""User-related API resources.

Includes listing, creation, retrieval, update, and password reset endpoints.
"""

from flask_restful import Resource
from flask import request
from backend.persistence.services import UserService
from flask_jwt_extended import get_jwt_identity
from typing import Any
from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.api.uploads import delete_uploaded_file, save_image_upload
from backend.models.user import User as DomainUser


service = UserService()


def _request_payload():
    if request.mimetype and request.mimetype.startswith('multipart/form-data'):
        return request.form.to_dict(flat=True)
    return request.get_json(silent=True) or {}


def _extract_profile_picture(payload):
    uploaded_file = request.files.get(
        'profile_picture_file') or request.files.get('profile_picture')
    if uploaded_file and uploaded_file.filename:
        return save_image_upload(uploaded_file, 'users/profile_pictures')
    return payload.get('profile_picture')


def _extract_business_card(payload):
    uploaded_file = request.files.get(
        'business_card_file') or request.files.get('business_card')
    if uploaded_file and uploaded_file.filename:
        return save_image_upload(uploaded_file, 'users/business_cards')
    return payload.get('business_card')


def _cleanup_replaced_upload(previous_path, new_path):
    if new_path and previous_path and previous_path != new_path:
        delete_uploaded_file(previous_path)


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
        data = _request_payload()
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        profile_picture = _extract_profile_picture(data)
        business_card = _extract_business_card(data)
        if not email or not password:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'email and password required', 400)
        # Validate using domain model to ensure consistent field checks
        try:
            DomainUser(email=email, password=password, first_name=first_name)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        try:
            user = service.register(
                email,
                password,
                first_name=first_name,
                profile_picture=profile_picture,
                business_card=business_card,
            )
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
        data = _request_payload()
        current_user = service.get_by_id(get_jwt_identity())
        if not current_user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        update_data: dict[str, Any] = {}
        previous_profile_picture = current_user.get('profile_picture')
        previous_business_card = current_user.get('business_card')
        try:
            if 'first_name' in data:
                first_name = DomainUser.validate_first_name(
                    data.get('first_name'))
                if first_name is not None:
                    update_data['first_name'] = first_name
            if 'last_name' in data:
                last_name = DomainUser.validate_last_name(
                    data.get('last_name'))
                if last_name is not None:
                    update_data['last_name'] = last_name
            uploaded_file = request.files.get(
                'profile_picture_file') or request.files.get('profile_picture')
            if uploaded_file and uploaded_file.filename:
                update_data['profile_picture'] = save_image_upload(
                    uploaded_file, 'users/profile_pictures')
            elif 'profile_picture' in data:
                update_data['profile_picture'] = data.get('profile_picture')
            uploaded_file = request.files.get(
                'business_card_file') or request.files.get('business_card')
            if uploaded_file and uploaded_file.filename:
                update_data['business_card'] = save_image_upload(
                    uploaded_file, 'users/business_cards')
            elif 'business_card' in data:
                update_data['business_card'] = data.get('business_card')
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)

        user = service.update(get_jwt_identity(), **update_data)
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        _cleanup_replaced_upload(
            previous_profile_picture, update_data.get('profile_picture'))
        _cleanup_replaced_upload(
            previous_business_card, update_data.get('business_card'))
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
        data = _request_payload()
        current_user = service.get_by_id(user_id)
        if not current_user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        first_name: Any = data.get('first_name')
        last_name: Any = data.get('last_name')
        # validate name fields to keep parity with creation checks
        try:
            fn = DomainUser.validate_first_name(first_name)
            ln = DomainUser.validate_last_name(last_name)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)

        update_data: dict[str, Any] = {'first_name': fn, 'last_name': ln}
        previous_profile_picture = current_user.get('profile_picture')
        previous_business_card = current_user.get('business_card')
        uploaded_file = request.files.get(
            'profile_picture_file') or request.files.get('profile_picture')
        if uploaded_file and uploaded_file.filename:
            update_data['profile_picture'] = save_image_upload(
                uploaded_file, 'users/profile_pictures')
        elif 'profile_picture' in data:
            update_data['profile_picture'] = data.get('profile_picture')
        uploaded_file = request.files.get(
            'business_card_file') or request.files.get('business_card')
        if uploaded_file and uploaded_file.filename:
            update_data['business_card'] = save_image_upload(
                uploaded_file, 'users/business_cards')
        elif 'business_card' in data:
            update_data['business_card'] = data.get('business_card')
        user = service.update(user_id, **update_data)
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        _cleanup_replaced_upload(
            previous_profile_picture, update_data.get('profile_picture'))
        _cleanup_replaced_upload(
            previous_business_card, update_data.get('business_card'))
        return {'user': user}

    @jwt_required()
    def patch(self, user_id):
        """Partial update for the user using provided JSON body."""
        data = _request_payload()
        current_user = service.get_by_id(user_id)
        if not current_user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        update_data: dict[str, Any] = {}
        # validate optional name fields when provided
        previous_profile_picture = current_user.get('profile_picture')
        previous_business_card = current_user.get('business_card')
        try:
            if 'first_name' in data:
                first_name = DomainUser.validate_first_name(
                    data.get('first_name'))
                if first_name is not None:
                    update_data['first_name'] = first_name
            if 'last_name' in data:
                last_name = DomainUser.validate_last_name(
                    data.get('last_name'))
                if last_name is not None:
                    update_data['last_name'] = last_name
            uploaded_file = request.files.get(
                'profile_picture_file') or request.files.get('profile_picture')
            if uploaded_file and uploaded_file.filename:
                update_data['profile_picture'] = save_image_upload(
                    uploaded_file, 'users/profile_pictures')
            elif 'profile_picture' in data:
                update_data['profile_picture'] = data.get('profile_picture')
            uploaded_file = request.files.get(
                'business_card_file') or request.files.get('business_card')
            if uploaded_file and uploaded_file.filename:
                update_data['business_card'] = save_image_upload(
                    uploaded_file, 'users/business_cards')
            elif 'business_card' in data:
                update_data['business_card'] = data.get('business_card')
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)

        user = service.update(user_id, **update_data)
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        _cleanup_replaced_upload(
            previous_profile_picture, update_data.get('profile_picture'))
        _cleanup_replaced_upload(
            previous_business_card, update_data.get('business_card'))
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
