"""datasource_to_datasource_instance_fk

Revision ID: b39604352175
Revises: 2b26f6f350ab
Create Date: 2025-09-19 14:00:17.250971

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision = 'b39604352175'
down_revision = '2b26f6f350ab'
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
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('builtin_name', sa.String(), nullable=False),
        sa.Column('kwargs', JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('publish', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('data_source_config_id', sa.Integer(), sa.ForeignKey('data_source_config.id'), nullable=True),
        sa.Column('ui_api_details', JSONB, nullable=True)
    )

    # Insert 'tol_production' data source instance into table
    conn.execute(
        text("""
        INSERT INTO data_source_instance (id, builtin_name, kwargs, publish, data_source_config_id, ui_api_details)
        VALUES ('tol_production', 'elastic', '{"dataspace": "tol_production"}', 'true', NULL, '{"url": "https://portal.tol.sanger.ac.uk", "apiPath": "/api/v1", "apiDataPath": "/data", "dataspace": "tol_production"}')
        """)
    )

    # Remove `datasource` fields
    op.drop_column('component', 'datasource')
    op.drop_column('zone', 'datasource')

    # Create new `data_source_instance_id` fields in their places,
    # with foreign keys linking to the `data_source_instance` table
    op.add_column('component', sa.Column('data_source_instance_id', sa.String, nullable=True))
    op.create_foreign_key(
        'fk_component_data_source_instance',
        'component', 'data_source_instance',
        ['data_source_instance_id'], ['id']
    )
    op.add_column('zone', sa.Column('data_source_instance_id', sa.String, nullable=True))
    op.create_foreign_key(
        'fk_zone_data_source_instance',
        'zone', 'data_source_instance',
        ['data_source_instance_id'], ['id']
    )

    # Pre-populate `datasource_instance_id` fields with 'tol-production'
    conn.execute(
        text("""
        UPDATE component
        SET data_source_instance_id='tol_production'
        """)
    )
    conn.execute(
        text("""
        UPDATE zone
        SET data_source_instance_id='tol_production'
        """)
    )

    # Set columns as NOT NULL now that data is populated
    op.alter_column('component', 'data_source_instance_id', nullable=False)
    op.alter_column('zone', 'data_source_instance_id', nullable=False)


def downgrade() -> None:
    pass
