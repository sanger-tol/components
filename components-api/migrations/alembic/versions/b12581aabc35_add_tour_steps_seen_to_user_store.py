"""Add tour_steps_seen to user store

Revision ID: b12581aabc35
Revises: b39604352175
Create Date: 2025-12-01 12:51:40.713554

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = 'b12581aabc35'
down_revision = 'b39604352175'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user', sa.Column('tours_seen', JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column('user', 'tours_seen')
