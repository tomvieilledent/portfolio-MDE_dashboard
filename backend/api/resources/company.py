from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt import jwt_required
from backend.models.company import Company as DomainCompany
from backend.persistence.services import CompanyService, UserService


company_service = CompanyService()
user_service = UserService()


class CompanyListResource(Resource):
    @jwt_required()
    def get(self):
        limit = request.args.get('limit', default=100, type=int)
        return {'companies': company_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        data = request.get_json(silent=True) or {}
        name = data.get('name')
        if not name:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'name is required', 400)
        try:
            DomainCompany(name=name,
                          description=data.get('description'),
                          website_link=data.get('website_link'),
                          company_picture=data.get('company_picture'),
                          admin_email=data.get('admin_email'),
                          admin_id=data.get('admin_id'))
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        try:
            company = company_service.facade.create(
                name,
                admin_email=data.get('admin_email'),
                admin_id=data.get('admin_id'),
                description=data.get('description'),
                website_link=data.get('website_link'),
                company_picture=data.get('company_picture'),
            )
        except Exception as exc:
            return error_response(ERROR_CODES['CONFLICT'], 'could not create company', 409, str(exc))
        return {'company': company}, 201


class CompanyResource(Resource):
    @jwt_required()
    def get(self, company_id):
        company = company_service.facade.get(company_id)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        return {'company': company}

    @jwt_required()
    def patch(self, company_id):
        data = request.get_json(silent=True) or {}
        company = company_service.facade.update(company_id, **data)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        return {'company': company}

    @jwt_required()
    def delete(self, company_id):
        if not company_service.facade.deactivate(company_id, by=get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        return {'msg': 'company deactivated'}


class CompanyUsersResource(Resource):
    @jwt_required()
    def get(self, company_id):
        company = company_service.facade.get(company_id)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        users = user_service.list_users_by_company(company_id)
        return {'users': users}


class CompanyAssignUserResource(Resource):
    @jwt_required()
    def post(self, company_id, user_id):
        company = company_service.facade.get(company_id)
        if not company:
            return error_response(ERROR_CODES['NOT_FOUND'], 'company not found', 404)
        updated = user_service.update(user_id, company_id=company_id)
        if not updated:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': updated}, 200

    @jwt_required()
    def delete(self, company_id, user_id):
        updated = user_service.update(user_id, company_id=None)
        if not updated:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'user': updated}, 200
