from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt import jwt_required
from backend.models.training import Training as DomainTraining
from backend.persistence.services import FormationUserService, TrainingService, UserService


training_service = TrainingService()
formation_service = FormationUserService()
user_service = UserService()


class TrainingListResource(Resource):
    @jwt_required()
    def get(self):
        limit = request.args.get('limit', default=100, type=int)
        return {'trainings': training_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        data = request.get_json(silent=True) or {}
        title = data.get('title')
        if not title:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'title is required', 400)
        try:
            DomainTraining(title=title,
                           description=data.get('description'),
                           picture=data.get('picture'),
                           company_id=data.get('company_id'))
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        try:
            training = training_service.facade.create(
                title,
                company_id=data.get('company_id'),
                description=data.get('description'),
                picture=data.get('picture'),
            )
        except Exception as exc:
            return error_response(ERROR_CODES['CONFLICT'], 'could not create training', 409, str(exc))
        return {'training': training}, 201


class TrainingResource(Resource):
    @jwt_required()
    def get(self, training_id):
        training = training_service.facade.get(training_id)
        if not training:
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        return {'training': training}

    @jwt_required()
    def patch(self, training_id):
        data = request.get_json(silent=True) or {}
        training = training_service.facade.update(training_id, **data)
        if not training:
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        return {'training': training}

    @jwt_required()
    def delete(self, training_id):
        if not training_service.facade.deactivate(training_id, by=get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        return {'msg': 'training deactivated'}


class TrainingEnrollResource(Resource):
    @jwt_required()
    def post(self, training_id):
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id') or get_jwt_identity()
        training = training_service.facade.get(training_id)
        if not training:
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        if not user_service.get_by_id(user_id):
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        enrollment = formation_service.facade.create(
            user_id, training_id, status=data.get('status'), progress=data.get('progress'))
        return {'enrollment': enrollment}, 201


class TrainingEnrollmentsResource(Resource):
    @jwt_required()
    def get(self, training_id):
        training = training_service.facade.get(training_id)
        if not training:
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        return {'enrollments': formation_service.facade.list_by_training(training_id)}


class UserTrainingsResource(Resource):
    @jwt_required()
    def get(self, user_id):
        user = user_service.get_by_id(user_id)
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'enrollments': formation_service.facade.list_by_user(user_id)}


class CurrentUserTrainingsResource(Resource):
    @jwt_required()
    def get(self):
        return {'enrollments': formation_service.facade.list_by_user(get_jwt_identity())}
