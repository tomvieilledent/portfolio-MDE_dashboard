"""add is_public flag to events and training_sessions

Revision ID: 0013_event_session_is_public
Revises: 0012_user_staff_permissions
Create Date: 2026-07-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0013_event_session_is_public'
down_revision = '0012_user_staff_permissions'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'events',
        sa.Column('is_public', sa.Boolean(), server_default=sa.false()),
    )
    op.add_column(
        'training_sessions',
        sa.Column('is_public', sa.Boolean(), server_default=sa.false()),
    )


def downgrade():
    op.drop_column('training_sessions', 'is_public')
    op.drop_column('events', 'is_public')
