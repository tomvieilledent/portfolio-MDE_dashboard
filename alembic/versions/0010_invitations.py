"""add invitations table (RSVP for events and trainings)

Revision ID: 0010_invitations
Revises: 0009_site_content
Create Date: 2026-06-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0010_invitations'
down_revision = '0009_site_content'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'invitations',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('target_type', sa.String(length=20), nullable=False),
        sa.Column('target_id', sa.String(length=36), nullable=False),
        sa.Column('target_title', sa.String(length=300)),
        sa.Column('inviter_id', sa.String(length=36), nullable=False),
        sa.Column('invitee_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='pending'),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True)),
        sa.Column('responded_at', sa.DateTime(timezone=True)),
    )


def downgrade():
    op.drop_table('invitations')
