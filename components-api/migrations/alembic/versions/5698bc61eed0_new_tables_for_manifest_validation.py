"""new tables for manifest validation

Revision ID: 5698bc61eed0
Revises: 23b51e802c2a
Create Date: 2025-06-04 10:23:31.293049

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5698bc61eed0'
down_revision = '23b51e802c2a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('pipeline',
                    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                    sa.Column('pipeline_name', sa.String(), nullable=False, unique=True),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('pipeline_name')
                    )

    op.create_table('pipeline_steps',
                    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                    sa.Column('pipeline_id', sa.Integer(), nullable=False),
                    sa.Column('step_name', sa.String(), nullable=False),
                    sa.Column('stage', sa.String(), nullable=False),
                    sa.Column('step_order', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['pipeline_id'], ['pipeline.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )

    op.create_table('upload',
                    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
                    sa.Column('s3_url', sa.String(), nullable=False),
                    sa.Column('spreadsheet_config', sa.String(), nullable=False),
                    sa.Column('user_id', sa.Integer(), nullable=False),
                    sa.Column('pipeline_name', sa.String(), nullable=False),
                    sa.Column('destination', sa.String(), nullable=False),
                    sa.Column('flow_run_id', sa.String(), nullable=False),
                    sa.Column('results', postgresql.JSONB(), nullable=True),
                    sa.Column('complete', sa.Boolean(), default=False, nullable=False),
                    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
                    sa.ForeignKeyConstraint(['pipeline_name'], ['pipeline.pipeline_name'], ),
                    sa.PrimaryKeyConstraint('id')
                    )


def downgrade() -> None:
    op.drop_table('upload')
    op.drop_table('pipeline_steps')
    op.drop_table('pipeline')
