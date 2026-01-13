"""add description to pipeline_step

Revision ID: 89b16fdcb865
Revises: d09ee584ae42
Create Date: 2026-01-06 11:27:28.737599

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '89b16fdcb865'
down_revision = 'd09ee584ae42'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('pipeline_steps', sa.Column('description', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('pipeline_steps', 'description')
