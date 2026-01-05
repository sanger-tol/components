"""isReady added to upload table

Revision ID: d09ee584ae42
Revises: f54a53491fa4
Create Date: 2025-12-18 14:46:22.114831

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = 'd09ee584ae42'
down_revision = 'f54a53491fa4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'upload',
        sa.Column('is_ready', sa.Boolean, nullable=False, default=False)
    )


def downgrade() -> None:
    pass
