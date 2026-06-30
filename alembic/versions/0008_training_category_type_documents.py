"""add training category, type and documents columns

Revision ID: 0008_training_category_type_documents
Revises: 0007_conversation_title
Create Date: 2026-06-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0008_training_category_type_documents'
down_revision = '0007_conversation_title'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('trainings') as batch_op:
        batch_op.add_column(
            sa.Column('category', sa.String(length=100), nullable=True))
        batch_op.add_column(
            sa.Column('type', sa.String(length=20),
                      nullable=True, server_default='formation'))
        batch_op.add_column(
            sa.Column('documents', sa.String(length=2000), nullable=True))


def downgrade():
    with op.batch_alter_table('trainings') as batch_op:
        batch_op.drop_column('documents')
        batch_op.drop_column('type')
        batch_op.drop_column('category')
