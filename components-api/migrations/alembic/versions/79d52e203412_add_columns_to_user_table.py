"""add columns to user table

Revision ID: 79d52e203412
Revises: 6375014c07b4
Create Date: 2026-06-25 13:18:24.606836

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '79d52e203412'
down_revision = '6375014c07b4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'user',
        sa.Column('name', sa.String, nullable=True),
    )
    op.add_column(
        'user',
        sa.Column('email', sa.String, nullable=True, unique=True),
    )
    op.add_column(
        'user',
        sa.Column('workplace', sa.String, nullable=True),
    )


def downgrade() -> None:
    op.drop_column('user', 'workplace')
    op.drop_column('user', 'email')
    op.drop_column('user', 'name')
