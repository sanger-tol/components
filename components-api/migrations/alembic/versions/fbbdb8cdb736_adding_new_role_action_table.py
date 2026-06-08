"""adding_new_role_action_table

Revision ID: fbbdb8cdb736
Revises: db0635afe457
Create Date: 2026-04-02 07:40:14.610647

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fbbdb8cdb736'
down_revision = 'db0635afe457'
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

    op.alter_column(
            "action",
            "flow_name",
            existing_type=sa.String(),
            nullable=True,
        )

def downgrade() -> None:
    pass
