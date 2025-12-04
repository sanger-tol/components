"""rename s3_url column to s3_bucket

Revision ID: f54a53491fa4
Revises: b12581aabc35
Create Date: 2025-12-03 15:17:10.731317

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f54a53491fa4'
down_revision = 'b12581aabc35'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('upload', 's3_url', new_column_name='s3_bucket')


def downgrade() -> None:
    op.alter_column('upload', 's3_bucket', new_column_name='s3_url')
