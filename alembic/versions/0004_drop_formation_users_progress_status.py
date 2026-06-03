"""drop progress and status columns from formation_users

Revision ID: 0004_drop_formation_users_progress_status
Revises: 0003_training_sessions
Create Date: 2026-06-03 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = '0004_drop_formation_users_progress_status'
down_revision = '0003_training_sessions'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('formation_users') as batch_op:
        batch_op.drop_column('progress')
        batch_op.drop_column('status')


def downgrade():
    with op.batch_alter_table('formation_users') as batch_op:
        batch_op.add_column(sa.Column('status', sa.String(50), nullable=True))
        batch_op.add_column(sa.Column('progress', sa.String(20), nullable=True))
