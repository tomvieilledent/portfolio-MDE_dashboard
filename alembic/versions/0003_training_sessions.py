"""add training_sessions and refactor formation_users

Revision ID: 0003_training_sessions
Revises: 0002_drop_user_is_admin
Create Date: 2026-06-03 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = '0003_training_sessions'
down_revision = '0002_drop_user_is_admin'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'training_sessions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('training_id', sa.String(36), nullable=False),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('max_participants', sa.Integer(), nullable=False),
        sa.Column('location', sa.String(512), nullable=True),
        sa.Column('link', sa.String(512), nullable=True),
        sa.Column('status', sa.String(50), nullable=True),
        sa.Column('created_by', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    with op.batch_alter_table('formation_users') as batch_op:
        batch_op.add_column(sa.Column('session_id', sa.String(36), nullable=True))
        batch_op.add_column(sa.Column('type', sa.String(50), nullable=True))
        batch_op.add_column(sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True))


def downgrade():
    op.drop_table('training_sessions')
    with op.batch_alter_table('formation_users') as batch_op:
        batch_op.drop_column('completed_at')
        batch_op.drop_column('type')
        batch_op.drop_column('session_id')
