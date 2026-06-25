"""merge heads

Revision ID: bf36783fe45b
Revises: 21120654879e, 606a8b287608
Create Date: 2026-06-08 12:53:46.810231

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bf36783fe45b'
down_revision = ('21120654879e', '606a8b287608')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
