"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2026-05-26 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=254), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(length=256), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=True),
        sa.Column('last_name', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=30), nullable=True),
        sa.Column('profile_picture', sa.String(length=256), nullable=True),
        sa.Column('business_card', sa.String(length=256), nullable=True),
        sa.Column('is_super_admin', sa.Boolean(), nullable=True),
        sa.Column('is_admin', sa.Boolean(), nullable=True),
        sa.Column('company_id', sa.String(length=36), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deactivate_by', sa.String(length=36), nullable=True),
        sa.Column('delete_by', sa.String(length=36), nullable=True),
    )

    op.create_table(
        'companies',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('website_link', sa.String(length=512), nullable=True),
        sa.Column('company_picture', sa.String(length=512), nullable=True),
        sa.Column('admin_email', sa.String(length=254), nullable=True),
        sa.Column('admin_id', sa.String(length=36), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deactivate_by', sa.String(length=36), nullable=True),
        sa.Column('delete_by', sa.String(length=36), nullable=True),
    )

    op.create_table(
        'trainings',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('company_id', sa.String(length=36), nullable=True),
        sa.Column('description', sa.String(length=2000), nullable=True),
        sa.Column('picture', sa.String(length=512), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deactivate_by', sa.String(length=36), nullable=True),
        sa.Column('delete_by', sa.String(length=36), nullable=True),
    )

    op.create_table(
        'messages',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('author_id', sa.String(length=36), nullable=False),
        sa.Column('recipient_id', sa.String(length=36), nullable=True),
        sa.Column('conversation_id', sa.String(length=36), nullable=True),
        sa.Column('content', sa.String(length=5000), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'conversations',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('participant_ids', sa.String(length=1000), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'conversation_participants',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('conversation_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'notifications',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('recipient_id', sa.String(length=36), nullable=False),
        sa.Column('content', sa.String(length=1000), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'news',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('source', sa.String(length=200), nullable=True),
        sa.Column('summary', sa.String(length=2000), nullable=True),
        sa.Column('url', sa.String(length=512), nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        'formation_users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('training_id', sa.String(length=36), nullable=False),
        sa.Column('enrolled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('progress', sa.String(length=20), nullable=True),
    )


def downgrade():
    op.drop_table('formation_users')
    op.drop_table('news')
    op.drop_table('notifications')
    op.drop_table('conversation_participants')
    op.drop_table('conversations')
    op.drop_table('messages')
    op.drop_table('trainings')
    op.drop_table('companies')
    op.drop_table('users')
