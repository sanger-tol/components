"""Add tol role

Revision ID: 052074d9270d
Revises: bf36783fe45b
Create Date: 2026-06-08 13:30:56.097501

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '052074d9270d'
down_revision = 'bf36783fe45b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('INSERT INTO "role" (id, name) VALUES (2, \'tol\');')


def downgrade() -> None:
    op.execute('DELETE FROM "role" WHERE name = \'tol\';')
