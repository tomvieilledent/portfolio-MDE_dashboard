"""add user is_company_admin column

Revision ID: 0006_user_is_company_admin
Revises: 0005_formation_users_saved
Create Date: 2026-06-25 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0006_user_is_company_admin'
down_revision = '0005_formation_users_saved'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(
            sa.Column('is_company_admin', sa.Boolean(),
                      nullable=True, server_default=sa.false()))
        batch_op.add_column(
            sa.Column('job_title', sa.String(length=120), nullable=True))


def downgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('job_title')
        batch_op.drop_column('is_company_admin')
