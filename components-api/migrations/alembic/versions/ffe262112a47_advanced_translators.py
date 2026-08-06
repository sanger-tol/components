"""advanced_translators

Revision ID: ffe262112a47
Revises: 85bc95064c18
Create Date: 2026-08-05 08:25:21.931618

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = 'ffe262112a47'
down_revision = '85bc95064c18'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('component', sa.Column(
        'filter_exclude_incoming',
        sa.Boolean(),
        nullable=False,
        server_default='false'
    ))
    op.add_column('zone', sa.Column(
        'translations',
        JSONB,
        nullable=False,
        server_default='{}'
    ))
    op.add_column('zone', sa.Column(
        'filter_exclude_incoming',
        sa.Boolean(),
        nullable=False,
        server_default='false'
    ))


def downgrade() -> None:
    op.drop_column('zone', 'filter_exclude_incoming')
    op.drop_column('component', 'translations')
    op.drop_column('component', 'filter_exclude_incoming')
