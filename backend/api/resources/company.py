"""Company-related API resources.

Create, list, update and deactivate companies; manage company users.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.models.company import Company as DomainCompany
from backend.persistence.services import CompanyService, UserService


company_service = CompanyService()
user_service = UserService()


class CompanyListResource(Resource):
    """List companies or create a new one.

    POST requires `name` and `admin_email`; optional fields: description,
    website_link, company_picture, admin_id.
    """

    @jwt_required()
    def get(self):
        """Return a list of companies, optional `limit` query param."""
        limit = request.args.get('limit', default=100, type=int)
        return {'companies': company_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        """Create a company after validating with domain model."""
        data = request.get_json(silent=True) or {}
        name = data.get('name')
        admin_email = data.get('admin_email')
        if not name:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'name is required', 400)
        if not admin_email:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'admin_email is required', 400)
        # sanitize admin_id: if provided but not a valid UUID, ignore it and
        # rely on admin_email to resolve the admin.
        admin_id = data.get('admin_id')
        if admin_id:
            try:
                import uuid

                # validate uuid string; keep as-is when valid
                uuid.UUID(str(admin_id))
            except Exception:
                return error_response(ERROR_CODES['VALIDATION_ERROR'], 'Admin ID must be a valid UUID', 400)

        try:
            DomainCompany(name=name,
                          description=data.get('description'),
                          website_link=data.get('website_link'),
                          company_picture=data.get('company_picture'),
                          admin_email=admin_email,
                          admin_id=admin_id)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        try:
            company = company_service.facade.create(
                name,
                admin_email=admin_email,
                admin_id=admin_id,
                description=data.get('description'),
                website_link=data.get('website_link'),
                company_picture=data.get('company_picture'),
            )
        except ValueError as exc:
            return error_response(ERROR_CODES['BAD_REQUEST'], str(exc), 400)
        except Exception as exc:
            return error_response(ERROR_CODES['CONFLICT'], 'could not create company', 409, str(exc))
        return {'company': company}, 201


class CompanyResource(Resource):
    """Retrieve, update or deactivate a company."""

    @jwt_required()
    def get(self, company_id):
        """Return company details by id."""
        company = company_service.facade.get(company_id)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        return {'company': company}

    @jwt_required()
    def patch(self, company_id):
        """Partially update a company's fields from JSON body."""
        data = request.get_json(silent=True) or {}

        # fetch current state to perform domain validation for partial updates
        current = company_service.facade.get(company_id)
        if not current:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)

        try:
            # initialize domain object with current values
            domain = DomainCompany(
                name=current.get('name'),
                description=current.get('description'),
                website_link=current.get('website_link'),
                company_picture=current.get('company_picture'),
                admin_email=current.get('admin_email'),
                admin_id=current.get('admin_id'),
            )
            # apply incoming partial fields to validate them
            for k, v in data.items():
                if hasattr(domain, k):
                    setattr(domain, k, v)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)

        company = company_service.facade.update(company_id, **data)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        return {'company': company}

    @jwt_required()
    def delete(self, company_id):
        """Soft-deactivate the company (set is_active False)."""
        if not company_service.facade.deactivate(company_id, by=get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        return {'msg': 'company deactivated'}


class CompanyUsersResource(Resource):
    """List users that belong to a company."""

    @jwt_required()
    def get(self, company_id):
        """Return users for the given company id."""
        company = company_service.facade.get(company_id)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        users = user_service.list_users_by_company(company_id)
        return {'users': users}


class CompanyAssignUserResource(Resource):
    """Assign or remove a user from a company."""

    @jwt_required()
    def post(self, company_id, user_id):
        """Assign a user to a company."""
        company = company_service.facade.get(company_id)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        updated = user_service.update(user_id, company_id=company_id)
        if not updated:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': updated}, 200

    @jwt_required()
    def delete(self, company_id, user_id):
        """Remove a user from a company (set company_id to None)."""
        updated = user_service.update(user_id, company_id=None)
        if not updated:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': updated}, 200
