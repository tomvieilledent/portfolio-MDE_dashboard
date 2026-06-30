"""add site_content table for editable content blocks

Revision ID: 0009_site_content
Revises: 0008_training_category_type_documents
Create Date: 2026-06-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0009_site_content'
down_revision = '0008_training_category_type_documents'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'site_content',
        sa.Column('key', sa.String(length=100), primary_key=True),
        sa.Column('value', sa.String(length=8000)),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
    )


def downgrade():
    op.drop_table('site_content')
