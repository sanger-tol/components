"""add action for run_data

Revision ID: e6f99a0bce16
Revises: 26fd2f3fa577
Create Date: 2025-07-10 07:47:05.340891

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session


# revision identifiers, used by Alembic.
revision = 'e6f99a0bce16'
down_revision = '26fd2f3fa577'
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    session = Session(bind=connection)

    session.execute(
        sa.text(
            '''INSERT INTO action (name, object_type, flow_name, params) 
            VALUES
                ('super fun EXPORT', 'run_data', 'action_example', '{"please": 42}'::JSONB);
            '''
        )
    )


def downgrade() -> None:
    pass
