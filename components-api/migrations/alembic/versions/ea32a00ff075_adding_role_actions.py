"""adding_role_actions

Revision ID: ea32a00ff075
Revises: 21120654879e
Create Date: 2026-03-31 10:27:48.120931

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ea32a00ff075'
down_revision = '21120654879e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'role_action',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('action_id', sa.Integer, nullable=False),
        sa.Column('role_id', sa.Integer, nullable=False),
        sa.ForeignKeyConstraint(
            ('action_id',),
            ['action.id'],
        ),
        sa.ForeignKeyConstraint(
            ('role_id',),
            ['role.id'],
        ),
    )


def downgrade() -> None:
    pass
