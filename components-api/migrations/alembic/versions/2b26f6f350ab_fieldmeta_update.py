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
    # Update the JSON field to remove 'data' and 'inactive' keys
    op.execute("""
        UPDATE component
        SET config = config - 'data' || jsonb_set(
            config - 'data',
            '{fieldMeta,order}',
            (config->'fieldMeta'->'order') - 'inactive'
        )
        WHERE config->'fieldMeta' IS NOT NULL;
    """)


def downgrade() -> None:
    pass