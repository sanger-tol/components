"""adjusting_config

Revision ID: 23b51e802c2a
Revises: 6f78e303cc80
Create Date: 2025-05-13 10:13:27.339547

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '23b51e802c2a'
down_revision = '6f78e303cc80'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        UPDATE component
        SET config = jsonb_set(
            config - 'type',  -- remove the old 'type'
            '{grouping}',     -- new key
            to_jsonb(config->'type')  -- reuse the old value
        )
        WHERE component_type = 'chart' AND config ? 'type';
    """)


def downgrade() -> None:
    pass
