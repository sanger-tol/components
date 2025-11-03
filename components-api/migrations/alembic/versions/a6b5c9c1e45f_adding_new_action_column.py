"""adding_new_action_column

Revision ID: a6b5c9c1e45f
Revises: 2b26f6f350ab
Create Date: 2025-11-03 13:29:01.812106

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a6b5c9c1e45f'
down_revision = '2b26f6f350ab'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('action', sa.Column('action_name', sa.String(), nullable=True))
    op.alter_column('action', 'flow_name', nullable=True)


def downgrade() -> None:
    pass
