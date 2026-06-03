"""Training-related API resources.

Provide endpoints for listing trainings, creating trainings,
enrolling users and listing enrollments.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.api.uploads import delete_uploaded_file, save_image_upload
from backend.models.training import Training as DomainTraining
from backend.persistence.services import FormationUserService, TrainingService, UserService


training_service = TrainingService()
formation_service = FormationUserService()
user_service = UserService()


def _request_payload():
    if request.mimetype and request.mimetype.startswith('multipart/form-data'):
        return request.form.to_dict(flat=True)
    return request.get_json(silent=True) or {}


def _extract_training_picture(payload):
    uploaded_file = request.files.get(
        'picture_file') or request.files.get('picture')
    if uploaded_file and uploaded_file.filename:
        return save_image_upload(uploaded_file, 'trainings')
    return payload.get('picture')


def _cleanup_replaced_upload(previous_path, new_path):
    if new_path and previous_path and previous_path != new_path:
        delete_uploaded_file(previous_path)


class TrainingListResource(Resource):
    """List trainings or create a new training.

    Methods
    -------
    get(limit: int)
        Return a paginated list of trainings.
    post()
        Create a training after validating the request body.
    """

    @jwt_required()
    def get(self):
        """Return a paginated list of trainings.

        Query parameters
        ----------------
        limit : int
            Maximum number of trainings to return (default 100).
        """
        limit = request.args.get('limit', default=100, type=int)
        return {'trainings': training_service.facade.list(limit=limit)}

    @jwt_required()
    def post(self):
        """Validate and create a new training.

        Expects JSON body with `title` (required) and optional
        `description`, `picture`, `company_id`.
        """
        current_user = user_service.get_by_id(get_jwt_identity())
        if not current_user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        if not current_user.get('is_super_admin'):
            return error_response(ERROR_CODES['FORBIDDEN'], 'only super admins can create trainings', 403)
        data = _request_payload()
        picture = _extract_training_picture(data)
        title = data.get('title')
        if not title:
            return error_response(ERROR_CODES['BAD_REQUEST'], 'title is required', 400)
        try:
            DomainTraining(title=title,
                           description=data.get('description'),
                           picture=picture,
                           company_id=data.get('company_id'))
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)
        try:
            training = training_service.facade.create(
                title,
                company_id=data.get('company_id'),
                description=data.get('description'),
                picture=picture,
            )
        except Exception as exc:
            return error_response(ERROR_CODES['CONFLICT'], 'could not create training', 409, str(exc))
        return {'training': training}, 201


class TrainingResource(Resource):
    """Operations on a single training (get/patch/delete)."""

    @jwt_required()
    def get(self, training_id):
        """Retrieve a training by id."""
        training = training_service.facade.get(training_id)
        if not training:
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        return {'training': training}

    @jwt_required()
    def patch(self, training_id):
        """Partially update a training's fields."""
        data = _request_payload()
        update_data: dict[str, object] = {}

        # fetch current training to validate partial updates via domain model
        current = training_service.facade.get(training_id)
        if not current:
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        previous_picture = current.get('picture')

        try:
            domain = DomainTraining(
                title=current.get('title'),
                description=current.get('description'),
                picture=current.get('picture'),
                company_id=current.get('company_id'),
            )
            for k, v in data.items():
                if hasattr(domain, k):
                    setattr(domain, k, v)
            uploaded_file = request.files.get(
                'picture_file') or request.files.get('picture')
            if uploaded_file and uploaded_file.filename:
                update_data['picture'] = save_image_upload(
                    uploaded_file, 'trainings')
            elif 'picture' in data:
                update_data['picture'] = data.get('picture')
            for field in ('title', 'description', 'company_id', 'is_active'):
                if field in data:
                    update_data[field] = data.get(field)
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)

        training = training_service.facade.update(training_id, **update_data)
        if not training:
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        _cleanup_replaced_upload(previous_picture, update_data.get('picture'))
        return {'training': training}

    @jwt_required()
    def delete(self, training_id):
        """Soft-deactivate a training (set `is_active` False)."""
        if not training_service.facade.deactivate(training_id, by=get_jwt_identity()):
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        return {'msg': 'training deactivated'}


class TrainingEnrollResource(Resource):
    """Enroll a user in a training (create a FormationUser relation)."""

    @jwt_required()
    def post(self, training_id):
        """Create an enrollment for `training_id`.

        JSON body may include `user_id`, `status`, `progress`. If `user_id`
        is omitted the current authenticated user is used.
        """
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
    """List enrollments for a given training."""

    @jwt_required()
    def get(self, training_id):
        training = training_service.facade.get(training_id)
        if not training:
            return error_response(ERROR_CODES['NOT_FOUND'], 'training not found', 404)
        return {'enrollments': formation_service.facade.list_by_training(training_id)}


class UserTrainingsResource(Resource):
    """List enrollments for a specific user."""

    @jwt_required()
    def get(self, user_id):
        user = user_service.get_by_id(user_id)
        if not user:
            return error_response(ERROR_CODES['NOT_FOUND'], 'user not found', 404)
        return {'enrollments': formation_service.facade.list_by_user(user_id)}


class CurrentUserTrainingsResource(Resource):
    """List enrollments for the current authenticated user."""

    @jwt_required()
    def get(self):
        return {'enrollments': formation_service.facade.list_by_user(get_jwt_identity())}
