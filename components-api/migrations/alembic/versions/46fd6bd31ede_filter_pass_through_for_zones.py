"""filter_pass_through_for_zones

Revision ID: 46fd6bd31ede
Revises: ffe262112a47
Create Date: 2026-08-11 10:55:00.090531

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '46fd6bd31ede'
down_revision = 'ffe262112a47'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Translations
    op.alter_column('zone', 'translations', new_column_name='attribute_translations')
    op.add_column('zone', sa.Column('relationship_translation', sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column('zone', sa.Column('translation_path', sa.TEXT, nullable=True))

    # Filter pass through
    op.add_column('zone', sa.Column('filter_pass_through', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    op.drop_column('zone', 'filter_pass_through')
    op.drop_column('zone', 'relationship_translation')
    op.drop_column('zone', 'translation_path')
    op.alter_column('zone', 'attribute_translations', new_column_name='translations')
