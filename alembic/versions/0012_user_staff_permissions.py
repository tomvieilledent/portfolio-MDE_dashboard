"""add staff flag and permissions to users

Revision ID: 0012_user_staff_permissions
Revises: 0011_company_kind
Create Date: 2026-06-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0012_user_staff_permissions'
down_revision = '0011_company_kind'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'users',
        sa.Column('is_staff', sa.Boolean(), server_default=sa.false()),
    )
    op.add_column(
        'users',
        sa.Column('permissions', sa.String(length=512)),
    )


def downgrade():
    op.drop_column('users', 'permissions')
    op.drop_column('users', 'is_staff')
