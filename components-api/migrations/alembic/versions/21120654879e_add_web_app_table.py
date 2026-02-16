"""add_web_app_table

Revision ID: 21120654879e
Revises: 4d4a26a80889
Create Date: 2026-02-09 10:57:12.477803
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Session


# revision identifiers, used by Alembic.
revision = "21120654879e"
down_revision = "4d4a26a80889"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "web_app",
        sa.Column("id", sa.String(), primary_key=True, nullable=False),
        sa.Column("navigation", JSONB, nullable=False, server_default=sa.text("'{}'::JSONB")),
        sa.Column("profile_navigation", JSONB, nullable=False, server_default=sa.text("'{}'::JSONB")),
    )

    connection = op.get_bind()
    session = Session(bind=connection)

    session.execute(
        sa.text(
            """
            INSERT INTO web_app (id, navigation, profile_navigation)
            VALUES (
                'components',
                '{
                  "data": {
                    "Home": {
                      "access": "public",
                      "path": {
                        "pageElementReference": "home",
                        "route": "/"
                      }
                    },
                    "Developer": {
                      "access": "public",
                      "pages": {
                        "data": {
                          "Code Style Guide": {
                            "access": "public",
                            "path": {
                              "pageElementReference": "codeStyleGuide"
                            }
                          },
                          "How To Document": {
                            "access": "public",
                            "path": {
                              "pageElementReference": "howToDocument"
                            }
                          }
                        },
                        "order": ["Code Style Guide", "How To Document"]
                      }
                    }
                  },
                  "order": ["Developer"]
                }'::JSONB,
                '{}'::JSONB
            );
            """
        )
    )


def downgrade() -> None:
    op.drop_table("web_app")
