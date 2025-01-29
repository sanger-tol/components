"""add auth tables

Revision ID: 657808c6d8d6
Revises: 95bf03ba112c
Create Date: 2024-02-05 14:26:50.815023

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision = '657808c6d8d6'
down_revision = '95bf03ba112c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    tables = inspector.get_table_names()
    if 'role' in tables:
        op.drop_table('role')
    if 'auth' in tables:
        op.drop_table('auth')
    if 'user' in tables:
        op.drop_constraint('sample_created_by_fkey', 'sample')
        op.drop_constraint('sample_last_modified_by_fkey', 'sample')
        op.drop_table('user')


    op.create_table(
        'oidc_state',
        sa.Column('id', sa.String, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False)
    )

    op.create_table(
        'user',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('oidc_id', sa.String, unique=True, nullable=False)
    )

    op.create_table(
        'oidc_token',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('token', sa.String, unique=True, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('expires_at', sa.DateTime, nullable=False),
        sa.Column('user_id', sa.Integer, nullable=False),
        sa.ForeignKeyConstraint(('user_id',), ['user.id'], ),
    )


def downgrade() -> None:
    pass
