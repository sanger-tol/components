"""actions_updates

Revision ID: 6f78e303cc80
Revises: 7b513d308beb
Create Date: 2025-03-20 11:29:29.613225

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = '6f78e303cc80'
down_revision = '85af1ec36306'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'user_action',
        sa.Column('ids', JSONB, nullable=True)
    )
    op.add_column(
        'user_action',
        sa.Column('filters', JSONB, nullable=True)
    )
    op.create_check_constraint(
        None,
        'user_action',
        'NOT(ids IS NULL AND filters IS NULL)'
    )


def downgrade() -> None:
    pass
