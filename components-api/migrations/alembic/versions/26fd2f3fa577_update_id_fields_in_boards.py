"""update id fields in boards

Revision ID: 26fd2f3fa577
Revises: 05ddf4259643
Create Date: 2025-07-08 20:36:10.083991

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision = '26fd2f3fa577'
down_revision = '05ddf4259643'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    # update the config field in the components table
    conn.execute(
        text("""
        UPDATE components
        SET config = jsonb_replace(config::jsonb, '"uid"', '"id"')
        WHERE config::text LIKE '%"uid"%'
        """)
    )


def downgrade() -> None:
    pass
