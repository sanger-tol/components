"""singular table

Revision ID: 18927584baf1
Revises: ac88937f67bd
Create Date: 2024-07-02 15:09:49.228476

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '18927584baf1'
down_revision = 'ac88937f67bd'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'singular',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True)
    )


def downgrade() -> None:
    pass
