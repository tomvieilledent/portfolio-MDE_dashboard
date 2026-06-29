"""add conversation title column

Revision ID: 0007_conversation_title
Revises: 0006_user_is_company_admin
Create Date: 2026-06-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0007_conversation_title'
down_revision = '0006_user_is_company_admin'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('conversations') as batch_op:
        batch_op.add_column(
            sa.Column('title', sa.String(length=200), nullable=True))


def downgrade():
    with op.batch_alter_table('conversations') as batch_op:
        batch_op.drop_column('title')
