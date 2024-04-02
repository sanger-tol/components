"""roles

Revision ID: 4d48986b1e20
Revises: 657808c6d8d6
Create Date: 2024-04-02 09:24:17.827583

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4d48986b1e20'
down_revision = '657808c6d8d6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'role',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String, unique=True, nullable=False),
    )
    op.create_table(
        'role_binding',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.Integer, nullable=False),
        sa.Column('role_id', sa.Integer, nullable=False),
        sa.ForeignKeyConstraint(('user_id',), ['user.id'], ),
        sa.ForeignKeyConstraint(('role_id',), ['role.id'], ),
    )


def downgrade() -> None:
    pass
