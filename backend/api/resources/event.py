"""Agenda event API resources."""

from flask import request
from flask_jwt_extended import get_jwt_identity
from flask_restful import Resource

from backend.api.errors import ERROR_CODES, error_response
from backend.api.jwt_helpers import jwt_required
from backend.models.event import Event as DomainEvent
from backend.persistence.services import EventService, UserService


event_service = EventService()
user_service = UserService()


def _can_edit(event, current_user):
    """Return ``True`` if *current_user* may edit/delete *event*.

    Allowed for the event creator or any super admin.
    """
    if not current_user:
        return False
    if current_user.get('is_super_admin'):
        return True
    return event.get('created_by') == current_user.get('id')


class EventListResource(Resource):
    """List all events or create a new one."""

    @jwt_required()
    def get(self):
        """Return all active events.

        Returns:
            tuple[dict, int]: ``{events}`` and 200.
        """
        return {'events': event_service.facade.list()}

    @jwt_required()
    def post(self):
        """Create an event. Allowed for any authenticated user.

        Expected JSON body:
            title (str): Event title (required).
            date (str): Day as ``YYYY-MM-DD`` (required).
            time (str | None): Optional time ``HH:MM``.
            color (str | None): Optional UI color class.
            description (str | None): Optional description.
            creator (str | None): Optional free-text creator label.

        Returns:
            tuple[dict, int]: ``{event}`` and 201, or 400.
        """
        data = request.get_json(silent=True) or {}
        try:
            DomainEvent(title=data.get('title'), date=data.get('date'))
        except Exception as exc:
            return error_response(ERROR_CODES['VALIDATION_ERROR'], str(exc), 400)

        event = event_service.facade.create(
            title=data.get('title'),
            date=data.get('date'),
            time=data.get('time'),
            color=data.get('color'),
            description=data.get('description'),
            creator=data.get('creator'),
            created_by=get_jwt_identity(),
        )
        return {'event': event}, 201


class EventResource(Resource):
    """Update or delete a single event."""

    @jwt_required()
    def patch(self, event_id):
        """Update an event. Restricted to its creator or a super admin.

        Args:
            event_id (str): Event UUID path parameter.

        Returns:
            tuple[dict, int]: ``{event}`` and 200, or 403/404.
        """
        event = event_service.facade.get(event_id)
        if not event:
            return error_response(ERROR_CODES['NOT_FOUND'], 'event not found', 404)
        current = user_service.get_by_id(get_jwt_identity())
        if not _can_edit(event, current):
            return error_response(
                ERROR_CODES['FORBIDDEN'],
                'not allowed to edit this event', 403)
        data = request.get_json(silent=True) or {}
        update = {f: data[f] for f in ('title', 'date', 'time', 'color',
                                       'description', 'creator') if f in data}
        result = event_service.facade.update(event_id, **update)
        return {'event': result}

    @jwt_required()
    def delete(self, event_id):
        """Delete an event. Restricted to its creator or a super admin.

        Args:
            event_id (str): Event UUID path parameter.

        Returns:
            tuple[dict, int]: ``{msg}`` and 200, or 403/404.
        """
        event = event_service.facade.get(event_id)
        if not event:
            return error_response(ERROR_CODES['NOT_FOUND'], 'event not found', 404)
        current = user_service.get_by_id(get_jwt_identity())
        if not _can_edit(event, current):
            return error_response(
                ERROR_CODES['FORBIDDEN'],
                'not allowed to delete this event', 403)
        event_service.facade.delete(event_id)
        return {'msg': 'event deleted'}
