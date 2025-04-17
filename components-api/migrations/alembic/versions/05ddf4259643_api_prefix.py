"""api prefix

Revision ID: 05ddf4259643
Revises: 6f78e303cc80
Create Date: 2025-04-17 11:10:09.252107

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '05ddf4259643'
down_revision = '6f78e303cc80'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add column with default value
    op.add_column('component', sa.Column('api_prefix', sa.String(), nullable=True))


def downgrade() -> None:
    pass
