"""rename token table

Revision ID: c5763f8e1095
Revises: 4d48986b1e20
Create Date: 2024-04-11 13:49:12.032402

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c5763f8e1095'
down_revision = '4d48986b1e20'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.rename_table('oidc_token', 'token')


def downgrade() -> None:
    op.rename_table('token', 'oidc_token')
