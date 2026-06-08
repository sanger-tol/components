"""update file validation config & tables

Revision ID: db0635afe457
Revises: c83d3dc6e323
Create Date: 2026-02-18 15:05:12.538552

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'db0635afe457'
down_revision = 'c83d3dc6e323'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column(
        'upload',
        'is_ready'
    )

    op.add_column(
        'upload',
        sa.Column('rejection_reason', sa.String(), nullable=True),
    )

    op.add_column(
        'upload',
        sa.Column(
            'validation_status',
            sa.String(),
            nullable=True,
            default='in_progress',
            server_default='in_progress'
        )
    )

    op.add_column(
        'upload',
        sa.Column('hidden', sa.Boolean(), default=False, nullable=True)
    )

    op.add_column(
        'upload',
        sa.Column('upload_name', sa.String(), nullable=True)
    )

    op.execute("""
        UPDATE pipeline_steps
        SET config = jsonb_set(
            jsonb_set(
                config,
                '{config_details,regexes,SANGER INSTITUTE,0,regex}',
                '"(^SAN\\\\d{8}$)|(^ERGA_[A-Z]{2}_[A-Z]{2}\\\\d{3}$)"'
            ),
            '{config_details,regexes,SANGER INSTITUTE,0,detail}',
            '"SPECIMEN_ID must start with SAN followed by 8 digits or ERGA format: ERGA_XX_XX000"'
        )
        WHERE id = 13
    """)

    op.execute("""
        INSERT INTO pipeline (id, name)
        VALUES (2, 'unused')
    """)
    
    op.execute("""
        SELECT setval(pg_get_serial_sequence('pipeline', 'id'), (SELECT MAX(id) FROM pipeline))
    """)

    op.execute("""
        UPDATE pipeline_steps
        SET pipeline_id = (SELECT id FROM pipeline WHERE name = 'unused')
        WHERE id IN (8, 24)
    """)

    op.execute("""
        UPDATE pipeline_steps
        SET config = jsonb_set(
            config,
            '{config_details,regexes}',
            (config->'config_details'->'regexes') || '[
                {
                    "key": "TIME_OF_COLLECTION",
                    "regex": "^([0-1][0-9]|2[0-4]):[0-5]\\\\d$|^$",
                    "is_error": true,
                    "detail": "Only HH:MM format is accepted."
                }
            ]'::jsonb
        )
        WHERE step_name = 'Pattern Matching'
    """)


def downgrade() -> None:
    pass
