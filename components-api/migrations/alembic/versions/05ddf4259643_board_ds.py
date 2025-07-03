"""board_ds

Revision ID: 05ddf4259643
Revises: 6f78e303cc80
Create Date: 2025-04-17 11:10:09.252107

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = '05ddf4259643'
down_revision = '23b51e802c2a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('component', sa.Column('datasource', JSONB, nullable=False, server_default='{}'))
    op.add_column('zone', sa.Column('datasource', JSONB, nullable=False, server_default='{}'))

    op.drop_column('component', 'base_url')
    op.drop_column('zone', 'base_url')


def downgrade() -> None:
    pass
