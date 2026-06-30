"""add kind column to companies (entreprise vs formateur)

Revision ID: 0011_company_kind
Revises: 0010_invitations
Create Date: 2026-06-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0011_company_kind'
down_revision = '0010_invitations'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'companies',
        sa.Column('kind', sa.String(length=20), server_default='company'),
    )


def downgrade():
    op.drop_column('companies', 'kind')
