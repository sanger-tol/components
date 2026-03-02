"""count_component_type_upgrade

Revision ID: 4d4a26a80889
Revises: 89b16fdcb865
Create Date: 2026-01-29 14:16:29.871234

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4d4a26a80889'
down_revision = '89b16fdcb865'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE component
        SET component_type = 'statistics'
        WHERE component_type = 'count';
        """
    )


def downgrade() -> None:
    pass
