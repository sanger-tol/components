"""filter_pass_through

Revision ID: 85af1ec36306
Revises: 7b513d308beb
Create Date: 2025-03-20 16:05:06.363267

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '85af1ec36306'
down_revision = '7b513d308beb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add column with default value
    op.add_column('component', sa.Column('filter_pass_through', sa.Boolean(), nullable=False, server_default=sa.false))

    # Update existing rows to ensure consistency
    op.execute("UPDATE component SET filter_pass_through = FALSE")


def downgrade() -> None:
    op.drop_column('component', 'filter_pass_through')