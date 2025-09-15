"""table_config_update

Revision ID: 2b26f6f350ab
Revises: 5698bc61eed0
Create Date: 2025-09-02 11:00:46.501532

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2b26f6f350ab'
down_revision = '5698bc61eed0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update fieldMeta in the config column to remove specified keys
    op.execute("""
        UPDATE component
        SET config = jsonb_set(
            jsonb_set(
                config,
                '{fieldMeta}',
                (config->'fieldMeta') - 'data'::TEXT
            ),
            '{fieldMeta,order}',
            (config->'fieldMeta'->'order') - 'inactive'::TEXT
        )
        WHERE config ? 'fieldMeta';
    """)

    # Remove the action key from the config column as actions not on boards yet
    op.execute("""
        UPDATE component
        SET config = config - 'action'
        WHERE config ? 'action';
    """)

    # Transform sort_by key into defaultSortByAttribute and defaultSortByType
    op.execute("""
        UPDATE component
        SET config = (
            CASE
                WHEN config->>'sort_by' = '' THEN config - 'sort_by'
                ELSE jsonb_set(
                    jsonb_set(
                        config - 'sort_by',
                        '{defaultSortByAttribute}',
                        to_jsonb(
                            CASE
                                WHEN config->>'sort_by' LIKE '-%' THEN substr(config->>'sort_by', 2)
                                ELSE config->>'sort_by'
                            END
                        )
                    ),
                    '{defaultSortByType}',
                    to_jsonb(
                        CASE
                            WHEN config->>'sort_by' LIKE '-%' THEN 'desc'
                            ELSE 'asc'
                        END
                    )
                )
            END
        )
        WHERE config ? 'sort_by';
    """)


def downgrade() -> None:
    pass