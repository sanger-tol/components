"""fieldMeta_update

Revision ID: 2b26f6f350ab
Revises: 5698bc61eed0
Create Date: 2025-09-02 11:00:46.501532

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2b26f6f350ab'
down_revision = '5698bc61eed0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update the JSONB column to remove the specified keys
    op.execute("""
        UPDATE component
        SET config = config - 'fieldMeta' || jsonb_set(
            config->'fieldMeta',
            '{data}',
            'null'::jsonb,
            true
        ) || jsonb_set(
            config->'fieldMeta',
            '{order,inactive}',
            'null'::jsonb,
            true
        )
        WHERE config ? 'fieldMeta';
    """)


def downgrade() -> None:
    pass
