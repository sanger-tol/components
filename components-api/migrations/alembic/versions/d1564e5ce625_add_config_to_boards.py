"""add_config_to_boards

Revision ID: d1564e5ce625
Revises: 46fd6bd31ede
Create Date: 2026-10-08 09:24:07.032509

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'd1564e5ce625'
down_revision = '46fd6bd31ede'
branch_labels = None
depends_on = None


def upgrade() -> None:
    for table in ("board", "view", "zone"):
        op.add_column(
            table,
            sa.Column(
                "config",
                postgresql.JSONB(),
                nullable=False,
                server_default=sa.text("'{}'::jsonb"),
            ),
        )


def downgrade() -> None:
    for table in ("zone", "view", "board"):
        op.drop_column(table, "config")
