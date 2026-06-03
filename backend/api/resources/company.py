"""Company-related API resources."""

import uuid

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.api.uploads import save_image_upload
from backend.api.resources._helpers import _cleanup_replaced_upload, _request_payload
from backend.models.company import Company as DomainCompany
from backend.persistence.services import CompanyService, UserService


company_service = CompanyService()
user_service = UserService()


def _extract_company_picture(payload):
    uploaded_file = (request.files.get('company_picture_file')
                     or request.files.get('company_picture'))
    if uploaded_file and uploaded_file.filename:
        return save_image_upload(uploaded_file, 'companies')
    return payload.get('company_picture')


class CompanyListResource(Resource):
    """List companies or create a new one."""

    @jwt_required()
    def get(self):
        """Return a list of companies.

        Query parameters:
            limit (int): Max companies to return (default 100).

        Returns:
            tuple[dict, int]: ``{companies}`` and 200.
        """
        limit = request.args.get('limit', default=100, type=int)
        return {'companies': company_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        """Create a company.

        Expected JSON body:
            name (str): Company display name.
            admin_email (str): Email of the admin user.
            description (str | None): Optional description.
            website_link (str | None): Optional website URL.
            admin_id (str | None): Optional explicit admin UUID.

        Returns:
            tuple[dict, int]: ``{company}`` and 201.
        """
        data = _request_payload()
        name = data.get('name')
        admin_email = data.get('admin_email')
        if not name:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'name is required', 400)
        if not admin_email:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'admin_email is required', 400)
        admin_id = data.get('admin_id')
        if admin_id:
            try:
                uuid.UUID(str(admin_id))
            except Exception:
                return error_response(ERROR_CODES['VALIDATION_ERROR'], 'Admin ID must be a valid UUID', 400)

        company_picture = _extract_company_picture(data)

        try:
            DomainCompany(
                name=name,
                description=data.get('description'),
                website_link=data.get('website_link'),
                company_picture=company_picture,
                admin_email=admin_email,
                admin_id=admin_id,
            )
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        try:
            company = company_service.facade.create(
                name,
                admin_email=admin_email,
                admin_id=admin_id,
                description=data.get('description'),
                website_link=data.get('website_link'),
                company_picture=company_picture,
            )
        except ValueError as exc:
            return error_response(ERROR_CODES['BAD_REQUEST'], str(exc), 400)
        except Exception as exc:
            return error_response(ERROR_CODES['CONFLICT'], 'could not create company', 409, str(exc))
        return {'company': company}, 201


class CompanyResource(Resource):
    """Retrieve, update or deactivate a single company."""

    @jwt_required()
    def get(self, company_id):
        """Return company details.

        Args:
            company_id (str): Company UUID path parameter.

        Returns:
            tuple[dict, int]: ``{company}`` and 200, or 404.
        """
        company = company_service.facade.get(company_id)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        return {'company': company}

    @jwt_required()
    def patch(self, company_id):
        """Partially update a company's fields.

        Args:
            company_id (str): Company UUID path parameter.

        Returns:
            tuple[dict, int]: ``{company}`` and 200.
        """
        data = _request_payload()
        update_data: dict[str, object] = {}

        current = company_service.facade.get(company_id)
        if not current:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        previous_company_picture = current.get('company_picture')

        try:
            domain = DomainCompany(
                name=current.get('name'),
                description=current.get('description'),
                website_link=current.get('website_link'),
                company_picture=current.get('company_picture'),
                admin_email=current.get('admin_email'),
                admin_id=current.get('admin_id'),
            )
            for k, v in data.items():
                if hasattr(domain, k):
                    setattr(domain, k, v)
            uploaded_file = (request.files.get('company_picture_file')
                             or request.files.get('company_picture'))
            if uploaded_file and uploaded_file.filename:
                update_data['company_picture'] = save_image_upload(uploaded_file, 'companies')
            elif 'company_picture' in data:
                update_data['company_picture'] = data.get('company_picture')
            for field in ('name', 'description', 'website_link',
                          'admin_email', 'admin_id', 'is_active'):
                if field in data:
                    update_data[field] = data.get(field)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)

        company = company_service.facade.update(company_id, **update_data)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        _cleanup_replaced_upload(previous_company_picture, update_data.get('company_picture'))
        return {'company': company}

    @jwt_required()
    def delete(self, company_id):
        """Soft-deactivate a company.

        Args:
            company_id (str): Company UUID path parameter.

        Returns:
            tuple[dict, int]: ``{msg}`` and 200, or 404.
        """
        if not company_service.facade.deactivate(company_id, by=get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        return {'msg': 'company deactivated'}


class CompanyUsersResource(Resource):
    """List users that belong to a specific company."""

    @jwt_required()
    def get(self, company_id):
        """Return users for a company.

        Args:
            company_id (str): Company UUID path parameter.

        Returns:
            tuple[dict, int]: ``{users}`` and 200, or 404.
        """
        if not company_service.facade.get(company_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        return {'users': user_service.list_users_by_company(company_id)}


class CompanyAssignUserResource(Resource):
    """Assign or remove a user from a company."""

    @jwt_required()
    def post(self, company_id, user_id):
        """Assign a user to a company.

        Args:
            company_id (str): Target company UUID.
            user_id (str): User UUID to assign.

        Returns:
            tuple[dict, int]: ``{user}`` and 200, or 404.
        """
        if not company_service.facade.get(company_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        updated = user_service.update(user_id, company_id=company_id)
        if not updated:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': updated}, 200

    @jwt_required()
    def delete(self, company_id, user_id):
        """Remove a user from a company.

        Args:
            company_id (str): Company UUID (used for routing only).
            user_id (str): User UUID to remove.

        Returns:
            tuple[dict, int]: ``{user}`` and 200, or 404.
        """
        updated = user_service.update(user_id, company_id=None)
        if not updated:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': updated}, 200
