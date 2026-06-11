"""Add test dataspace

Revision ID: 6375014c07b4
Revises: 052074d9270d
Create Date: 2026-06-09 07:56:30.531117

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6375014c07b4'
down_revision = '052074d9270d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO data_source_instance (
            id, builtin_name, kwargs, publish, ui_api_details
        ) VALUES (
            'test',
            'elastic',
            '{"dataspace": "test"}',
            true,
            '{
                "url": "https://portal.tol.sanger.ac.uk",
                "apiPath": "/api/v1",
                "dataspace": "test",
                "apiDataPath": "/data"
            }'
        );
    """)


def downgrade() -> None:
    op.execute('DELETE FROM data_source_instance WHERE id = \'test\'')
