"""dealing with auth tables

Revision ID: ac88937f67bd
Revises: 4d48986b1e20
Create Date: 2024-06-12 12:38:14.696274

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ac88937f67bd'
down_revision = '4d48986b1e20'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_table('state')
    op.rename_table('oidc_token', 'token')


def downgrade() -> None:
    pass
