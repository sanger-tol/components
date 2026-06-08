"""Add the tours_seen column to the user table

Revision ID: 606a8b287608
Revises: b4559bcbcef0
Create Date: 2026-04-13 14:59:36.874934

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = '606a8b287608'
down_revision = 'b4559bcbcef0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user', sa.Column('tours_seen', JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column('user', 'tours_seen')
