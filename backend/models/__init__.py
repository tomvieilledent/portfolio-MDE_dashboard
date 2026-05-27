"""Model package exports.

This module re-exports domain model classes for convenient imports like
`from backend.models import User`.
"""

from .base import BaseModel
from .user import User
from .company import Company
from .training import Training
from .formation_user import FormationUser
from .conversation import Conversation
from .message import Message
from .notification import Notification
from .news import News

__all__ = [
    "BaseModel",
    "User",
    "Company",
    "Training",
    "FormationUser",
    "Conversation",
    "Message",
    "Notification",
    "News",
]

# Backwards compatibility alias
Enrollment = FormationUser
