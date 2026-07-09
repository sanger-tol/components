"""adding_warden_role

Revision ID: 85bc95064c18
Revises: 79d52e203412
Create Date: 2026-07-06 09:07:08.951877

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '85bc95064c18'
down_revision = '79d52e203412'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO role (id, name)
        VALUES (3, 'warden');
    """)


def downgrade() -> None:
    pass
