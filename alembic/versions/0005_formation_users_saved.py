"""add saved bookmark column to formation_users

Revision ID: 0005_formation_users_saved
Revises: 0004_drop_formation_users_progress_status
Create Date: 2026-06-24 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = '0005_formation_users_saved'
down_revision = '0004_drop_formation_users_progress_status'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('formation_users') as batch_op:
        batch_op.add_column(
            sa.Column('saved', sa.Boolean(),
                      nullable=False, server_default=sa.false()))


def downgrade():
    with op.batch_alter_table('formation_users') as batch_op:
        batch_op.drop_column('saved')
