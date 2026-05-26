from typing import Any

from backend.persistence.db import SessionLocal
from backend.persistence.models import User as ORMUser
from backend.persistence.services.facades import (
    UserFacade,
    CompanyFacade,
    TrainingFacade,
    MessageFacade,
    ConversationFacade,
    ConversationParticipantFacade,
    NotificationFacade,
    NewsFacade,
    FormationUserFacade,
)


class UserService:
    def __init__(self):
        self.facade = UserFacade()

    def register(self, email, password, first_name=None, last_name=None, **kwargs):
        return self.facade.create_user(email, password, first_name=first_name, last_name=last_name, **kwargs)

    def login(self, email, password):
        if not self.facade.check_password(email, password):
            return None
        return self.facade.get_by_email(email)

    def list_users(self, limit=100):
        return self.facade.list_users(limit=limit)

    def list_users_by_company(self, company_id, limit=100):
        return self.facade.list_users(limit=limit, company_id=company_id)

    def get_by_id(self, user_id):
        return self.facade.get_by_id(user_id)

    def update(self, user_id, **kwargs):
        return self.facade.update(user_id, **kwargs)

    def reset_password(self, user_id, password):
        return self.facade.reset_password(user_id, password)

    def deactivate(self, identifier, by=None):
        return self.facade.deactivate(identifier, by=by)

    def _to_dict(self, user):
        if not user:
            return None
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
        }


class CompanyService:
    def __init__(self):
        self.facade = CompanyFacade()


class TrainingService:
    def __init__(self):
        self.facade = TrainingFacade()


class MessageService:
    def __init__(self):
        self.facade = MessageFacade()


class ConversationService:
    def __init__(self):
        self.facade = ConversationFacade()


class ConversationParticipantService:
    def __init__(self):
        self.facade = ConversationParticipantFacade()


class NotificationService:
    def __init__(self):
        self.facade = NotificationFacade()


class NewsService:
    def __init__(self):
        self.facade = NewsFacade()


class FormationUserService:
    def __init__(self):
        self.facade = FormationUserFacade()
