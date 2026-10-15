"""updating_datasource_instance

Revision ID: a15eaa5a3efa
Revises: d1564e5ce625
Create Date: 2026-10-15 13:56:16.195154

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a15eaa5a3efa'
down_revision = 'd1564e5ce625'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'data_source_instance',
        sa.Column('direct_name', sa.String(), nullable=True)
    )
    op.add_column(
        'data_source_instance',
        sa.Column('direct_kwargs', sa.JSON(), nullable=True)
    )
    op.add_column(
        'data_source_instance',
        sa.Column('api_name', sa.String(), nullable=True)
    )
    op.add_column(
        'data_source_instance',
        sa.Column('api_kwargs', sa.JSON(), nullable=True)
    )

    op.execute(
        """
        UPDATE data_source_instance
        SET direct_name = builtin_name, direct_kwargs = kwargs
        """
    )

    op.execute(
        """
        UPDATE data_source_instance
        SET api_name = 'portal',
            api_kwargs = json_build_object(
                'dataspace', id
            )
        WHERE direct_name = 'elastic'
        AND publish = true
        """
    )


def downgrade() -> None:
    pass
