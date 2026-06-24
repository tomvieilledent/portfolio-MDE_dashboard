"""User-related API resources."""

from typing import Any

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.api.uploads import save_image_upload
from backend.api.resources._helpers import _cleanup_replaced_upload, _request_payload
from backend.models.user import User as DomainUser
from backend.persistence.services import UserService


service = UserService()


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


class UserListResource(Resource):
    """List users or create a new user."""

    @jwt_required()
    def get(self):
        """Return users, optionally filtered by company.

        Query parameters:
            limit (int): Max users to return (default 100).
            company_id (str): Filter by company UUID.

        Returns:
            tuple[dict, int]: ``{users}`` and 200.
        """
        limit = request.args.get('limit', default=100, type=int)
        company_id = request.args.get('company_id')
        if company_id:
            return {'users': service.list_users_by_company(company_id, limit=limit)}
        return {'users': service.list_users(limit=limit)}

    @jwt_required()
    def post(self):
        """Create a new user.

        Expected JSON body:
            email (str): Valid email address.
            password (str): Password (min 8 chars).
            first_name (str | None): Optional first name.

        Returns:
            tuple[dict, int]: ``{user}`` and 201.
        """
        data = _request_payload()
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        profile_picture = _extract_profile_picture(data)
        business_card = _extract_business_card(data)
        if not email or not password:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'email and password required', 400)
        try:
            DomainUser(email=email, password=password, first_name=first_name)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        try:
            user = service.register(
                email, password,
                first_name=first_name,
                profile_picture=profile_picture,
                business_card=business_card,
            )
        except Exception as exc:
            return error_response(ERROR_CODES['CONFLICT'], 'could not create user', 409, str(exc))
        return {'user': user}, 201


class UserMeResource(Resource):
    """Operations on the currently authenticated user."""

    @jwt_required()
    def get(self):
        """Return the current user's profile.

        Returns:
            tuple[dict, int]: ``{user}`` and 200.
        """
        user = service.get_by_id(get_jwt_identity())
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': user}

    @jwt_required()
    def patch(self):
        """Partially update the current user's profile.

        Accepts JSON or multipart form data. Updatable fields: ``first_name``,
        ``last_name``, ``profile_picture``, ``business_card``.

        Returns:
            tuple[dict, int]: ``{user}`` and 200.
        """
        data = _request_payload()
        current_user = service.get_by_id(get_jwt_identity())
        if not current_user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        update_data: dict[str, Any] = {}
        previous_profile_picture = current_user.get('profile_picture')
        previous_business_card = current_user.get('business_card')
        try:
            if 'first_name' in data:
                fn = DomainUser.validate_first_name(data.get('first_name'))
                if fn is not None:
                    update_data['first_name'] = fn
            if 'last_name' in data:
                ln = DomainUser.validate_last_name(data.get('last_name'))
                if ln is not None:
                    update_data['last_name'] = ln
            if 'phone' in data:
                update_data['phone'] = data.get('phone')
            uploaded_file = (request.files.get('profile_picture_file')
                             or request.files.get('profile_picture'))
            if uploaded_file and uploaded_file.filename:
                update_data['profile_picture'] = save_image_upload(
                    uploaded_file, 'users/profile_pictures')
            elif 'profile_picture' in data:
                update_data['profile_picture'] = data.get('profile_picture')
            uploaded_file = (request.files.get('business_card_file')
                             or request.files.get('business_card'))
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
        _cleanup_replaced_upload(previous_profile_picture, update_data.get('profile_picture'))
        _cleanup_replaced_upload(previous_business_card, update_data.get('business_card'))
        return {'user': user}


class UserResource(Resource):
    """CRUD operations on a specific user identified by ``user_id``."""

    @jwt_required()
    def get(self, user_id):
        """Retrieve a user by id.

        Args:
            user_id (str): User UUID path parameter.

        Returns:
            tuple[dict, int]: ``{user}`` and 200, or 404.
        """
        u = service.get_by_id(user_id)
        if not u:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': u}

    @jwt_required()
    def put(self, user_id):
        """Replace a user's name fields.

        Args:
            user_id (str): User UUID path parameter.

        Returns:
            tuple[dict, int]: ``{user}`` and 200.
        """
        data = _request_payload()
        current_user = service.get_by_id(user_id)
        if not current_user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        first_name: Any = data.get('first_name')
        last_name: Any = data.get('last_name')
        try:
            fn = DomainUser.validate_first_name(first_name)
            ln = DomainUser.validate_last_name(last_name)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)

        update_data: dict[str, Any] = {'first_name': fn, 'last_name': ln}
        previous_profile_picture = current_user.get('profile_picture')
        previous_business_card = current_user.get('business_card')
        uploaded_file = (request.files.get('profile_picture_file')
                         or request.files.get('profile_picture'))
        if uploaded_file and uploaded_file.filename:
            update_data['profile_picture'] = save_image_upload(
                uploaded_file, 'users/profile_pictures')
        elif 'profile_picture' in data:
            update_data['profile_picture'] = data.get('profile_picture')
        uploaded_file = (request.files.get('business_card_file')
                         or request.files.get('business_card'))
        if uploaded_file and uploaded_file.filename:
            update_data['business_card'] = save_image_upload(
                uploaded_file, 'users/business_cards')
        elif 'business_card' in data:
            update_data['business_card'] = data.get('business_card')
        user = service.update(user_id, **update_data)
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        _cleanup_replaced_upload(previous_profile_picture, update_data.get('profile_picture'))
        _cleanup_replaced_upload(previous_business_card, update_data.get('business_card'))
        return {'user': user}

    @jwt_required()
    def patch(self, user_id):
        """Partially update a user's profile fields.

        Args:
            user_id (str): User UUID path parameter.

        Returns:
            tuple[dict, int]: ``{user}`` and 200.
        """
        data = _request_payload()
        current_user = service.get_by_id(user_id)
        if not current_user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        update_data: dict[str, Any] = {}
        previous_profile_picture = current_user.get('profile_picture')
        previous_business_card = current_user.get('business_card')
        try:
            if 'first_name' in data:
                fn = DomainUser.validate_first_name(data.get('first_name'))
                if fn is not None:
                    update_data['first_name'] = fn
            if 'last_name' in data:
                ln = DomainUser.validate_last_name(data.get('last_name'))
                if ln is not None:
                    update_data['last_name'] = ln
            if 'phone' in data:
                update_data['phone'] = data.get('phone')
            uploaded_file = (request.files.get('profile_picture_file')
                             or request.files.get('profile_picture'))
            if uploaded_file and uploaded_file.filename:
                update_data['profile_picture'] = save_image_upload(
                    uploaded_file, 'users/profile_pictures')
            elif 'profile_picture' in data:
                update_data['profile_picture'] = data.get('profile_picture')
            uploaded_file = (request.files.get('business_card_file')
                             or request.files.get('business_card'))
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
        _cleanup_replaced_upload(previous_profile_picture, update_data.get('profile_picture'))
        _cleanup_replaced_upload(previous_business_card, update_data.get('business_card'))
        return {'user': user}

    @jwt_required()
    def delete(self, user_id):
        """Permanently delete a user (super admins only).

        Args:
            user_id (str): User UUID path parameter.

        Returns:
            tuple[dict, int]: ``{msg}`` and 200, 403, or 404.
        """
        current = service.get_by_id(get_jwt_identity())
        if not current or not current.get('is_super_admin'):
            return error_response(
                ERROR_CODES['FORBIDDEN'],
                'only super admins can delete users', 403)
        if not service.delete(user_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'msg': 'user deleted'}


class UserDeactivateResource(Resource):
    """Soft-deactivate a user without removing the database row."""

    @jwt_required()
    def patch(self, user_id):
        """Deactivate a user by id.

        Allowed for a super admin (any user) or for a user deactivating
        their own account.

        Args:
            user_id (str): User UUID path parameter.

        Returns:
            tuple[dict, int]: ``{msg}`` and 200, 403, or 404.
        """
        identity = get_jwt_identity()
        current = service.get_by_id(identity)
        is_super_admin = bool(current and current.get('is_super_admin'))
        if identity != user_id and not is_super_admin:
            return error_response(
                ERROR_CODES['FORBIDDEN'],
                'not allowed to deactivate this user', 403)
        if not service.deactivate(user_id, by='api'):
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'msg': 'deactivated'}


class UserResetPasswordResource(Resource):
    """Reset a user's password."""

    @jwt_required()
    def post(self, user_id):
        """Set a new password for the given user.

        Args:
            user_id (str): User UUID path parameter.

        Expected JSON body:
            password (str): New plaintext password.

        Returns:
            tuple[dict, int]: ``{msg}`` and 200, or 404.
        """
        data = request.get_json(silent=True) or {}
        password = data.get('password')
        if not password:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'password is required', 400)
        if not service.reset_password(user_id, password):
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'msg': 'password updated'}
