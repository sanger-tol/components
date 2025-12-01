# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from sqlalchemy.orm import (
    Mapped,
    declared_attr,
    relationship,
    mapped_column,
)
from sqlalchemy.dialects.postgresql import JSONB


class UserMixin:

    @declared_attr
    def user_actions(self) -> Mapped[list['UserAction']]:  # noqa F821
        return relationship(
            back_populates='user'
        )

    @declared_attr
    def tour_steps_seen(self) -> Mapped[dict]:
        return mapped_column(JSONB, nullable=True, default=dict)
