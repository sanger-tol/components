"""add new user role and migrate users to that role

Revision ID: bbc207dbbf53
Revises: None
Create Date: 2026-01-20 11:03:01.877218

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bbc207dbbf53'
down_revision = 'f54a53491fa4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
