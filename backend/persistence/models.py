"""SQLAlchemy ORM models used for persistence.

This module defines the tables and columns used by Alembic migrations and
by the persistence layer.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Integer
from .db import Base
import uuid
from datetime import datetime, timezone


class User(Base):
    __tablename__ = 'users'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    email = Column(String(254), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone = Column(String(30))
    profile_picture = Column(String(256))
    business_card = Column(String(256))
    is_super_admin = Column(Boolean, default=False)
    company_id = Column(String(36))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))
    uploaded_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True),
                        onupdate=lambda: datetime.now(timezone.utc))
    deactivate_by = Column(String(36))
    delete_by = Column(String(36))


class Company(Base):
    __tablename__ = 'companies'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    description = Column(String(2000))
    website_link = Column(String(512))
    company_picture = Column(String(512))
    admin_email = Column(String(254))
    admin_id = Column(String(36))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))
    uploaded_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True),
                        onupdate=lambda: datetime.now(timezone.utc))
    deactivate_by = Column(String(36))
    delete_by = Column(String(36))


class Training(Base):
    __tablename__ = 'trainings'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    company_id = Column(String(36))
    description = Column(String(2000))
    picture = Column(String(512))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))
    uploaded_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True),
                        onupdate=lambda: datetime.now(timezone.utc))
    deactivate_by = Column(String(36))
    delete_by = Column(String(36))


class Message(Base):
    __tablename__ = 'messages'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    author_id = Column(String(36), nullable=False)
    recipient_id = Column(String(36))
    conversation_id = Column(String(36))
    content = Column(String(5000), nullable=False)
    is_read = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))
    uploaded_at = Column(DateTime(timezone=True))


class Conversation(Base):
    __tablename__ = 'conversations'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    # participant_ids stored as a comma-separated string for simplicity
    participant_ids = Column(String(1000))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))
    uploaded_at = Column(DateTime(timezone=True))


class ConversationParticipant(Base):
    __tablename__ = 'conversation_participants'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), nullable=False)
    user_id = Column(String(36), nullable=False)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))
    uploaded_at = Column(DateTime(timezone=True))


class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    recipient_id = Column(String(36), nullable=False)
    content = Column(String(1000), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))


class News(Base):
    __tablename__ = 'news'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    title = Column(String(500), nullable=False)
    source = Column(String(200))
    summary = Column(String(2000))
    url = Column(String(512))
    category = Column(String(100))
    published_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))


class TrainingSession(Base):
    __tablename__ = 'training_sessions'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    training_id = Column(String(36), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    max_participants = Column(Integer(), nullable=False)
    location = Column(String(512))
    link = Column(String(512))
    status = Column(String(50), default='upcoming')
    created_by = Column(String(36))
    created_at = Column(DateTime(timezone=True),
                        default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True),
                        onupdate=lambda: datetime.now(timezone.utc))


class FormationUser(Base):
    __tablename__ = 'formation_users'
    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    training_id = Column(String(36), nullable=False)
    session_id = Column(String(36))
    type = Column(String(50))
    saved = Column(Boolean, default=False)
    enrolled_at = Column(DateTime(timezone=True),
                         default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True))
