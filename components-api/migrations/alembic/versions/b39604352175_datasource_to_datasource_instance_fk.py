"""datasource_to_datasource_instance_fk

Revision ID: b39604352175
Revises: 5698bc61eed0
Create Date: 2025-09-19 14:00:17.250971

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision = 'b39604352175'
down_revision = '5698bc61eed0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create `data_source_config` table (needed for the `data_source_instance` table)
    op.create_table(
        'data_source_config',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
    )

    # Create `data_source_config_attribute` table (needed for the `data_source_instance` table)
    op.create_table(
        'data_source_config_attribute',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('data_source_config_id', sa.Integer(), sa.ForeignKey('data_source_config.id'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('object_type', sa.String(), nullable=False),
        sa.Column('display_name', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('available_on_relationships', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_authoritative', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('runtime_definition', JSONB(astext_type=sa.Text()), nullable=True),
    )

    # Create `data_source_config_relationship` table (needed for the `data_source_instance` table)
    op.create_table(
        'data_source_config_relationship',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('object_type', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('foreign_object_type', sa.String(), nullable=False),
        sa.Column('foreign_name', sa.String(), nullable=False),
        sa.Column('data_source_config_id', sa.Integer(), sa.ForeignKey('data_source_config.id'), nullable=False),
    )

    # Create `data_source_instance` table
    op.create_table(
        'data_source_instance',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('builtin_name', sa.String(), nullable=False),
        sa.Column('kwargs', JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('publish', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('data_source_config_id', sa.Integer(), sa.ForeignKey('data_source_config.id'), nullable=True),
        sa.Column('api_details', JSONB, nullable=True)
    )

    # Insert 'tol_production' data source instance into table
    conn.execute(
        text("""
        INSERT INTO data_source_instance (id, name, builtin_name, kwargs, publish, data_source_config_id, api_details)
        VALUES ('1', 'tol_production', 'portal', '{"dataspace": "tol_production"}', 'false', NULL, '{"url": "https://portal.tol.sanger.ac.uk", "api_path": "/api/v1", "api_data_path": "/data", "dataspace": "tol_production"}')
        """)
    )

    # Remove `datasource` fields
    op.drop_column('component', 'datasource')
    op.drop_column('zone', 'datasource')

    # Create new `data_source_instance_id` fields in their places,
    # with foreign keys linking to the `data_source_instance` table
    op.add_column('component', sa.Column('data_source_instance_id', sa.Integer, nullable=False))
    op.create_foreign_key(
        'fk_component_data_source_instance',
        'component', 'data_source_instance',
        ['data_source_instance_id'], ['id']
    )
    op.add_column('zone', sa.Column('data_source_instance_id', sa.Integer, nullable=False))
    op.create_foreign_key(
        'fk_zone_data_source_instance',
        'zone', 'data_source_instance',
        ['data_source_instance_id'], ['id']
    )

    # Pre-populate `datasource_instance_id` fields with `1` ('tol-production')
    conn.execute(
        text("""
        UPDATE component
        SET data_source_instance_id=1
        """)
    )
    conn.execute(
        text("""
        UPDATE zone
        SET data_source_instance_id=1
        """)
    )


def downgrade() -> None:
    # Drop the new tables
    op.drop_table('data_source_config')
    op.drop_table('data_source_config_attribute')
    op.drop_table('data_source_config_relationship')
    op.drop_table('data_source_instance')

    # Remove `data_source_instance_id` fields from `component` and `zone` tables
    op.drop_constraint('fk_component_data_source_instance', 'component')
    op.drop_column('component', 'data_source_instance_id')
    op.drop_constraint('fk_zone_data_source_instance', 'zone')
    op.drop_column('zone', 'data_source_instance_id')

    # Replace back old `datasource` field into these tables
    op.add_column('component', sa.Column('datasource', JSONB, nullable=False, server_default='{}'))
    op.add_column('zone', sa.Column('datasource', JSONB, nullable=False, server_default='{}'))
