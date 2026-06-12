"""create new entity_diffs table

Revision ID: b4559bcbcef0
Revises: fbbdb8cdb736
Create Date: 2026-04-13 07:44:31.468831

"""
from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = 'b4559bcbcef0'
down_revision = 'fbbdb8cdb736'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'entity_diff',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('component_id', sa.String(), nullable=False),
        sa.Column('config', JSONB(), nullable=False),

        sa.ForeignKeyConstraint(['user_id'], ['user.id']),
        sa.ForeignKeyConstraint(['component_id'], ['component.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Set all view titles to 'View 1'
    view_table = sa.table('view', sa.column('title', sa.String()))
    op.execute(view_table.update().values(title='View 1'))

    # Replace non-deferred unique constraints with deferred ones
    for table, columns, old_name in [
        ('component_zone', ['zone_id', 'order'], 'component_zone_zone_id_order_key'),
        ('zone_view',      ['view_id', 'order'], 'zone_view_view_id_order_key'),
        ('view_board',     ['board_id', 'order'], 'view_board_board_id_order_key'),
    ]:
        op.drop_constraint(old_name, table, type_='unique')
        op.create_unique_constraint(
            old_name, table, columns,
            deferrable=True, initially='DEFERRED'
        )


def downgrade() -> None:
    # Revert deferred constraints back to non-deferred
    for table, columns, name in [
        ('component_zone', ['zone_id', 'order'], 'component_zone_zone_id_order_key'),
        ('zone_view',      ['view_id', 'order'], 'zone_view_view_id_order_key'),
        ('view_board',     ['board_id', 'order'], 'view_board_board_id_order_key'),
    ]:
        op.drop_constraint(name, table, type_='unique')
        op.create_unique_constraint(name, table, columns)

    op.drop_table('entity_diff')
