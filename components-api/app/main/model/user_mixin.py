# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from sqlalchemy.orm import (
    Mapped,
    declared_attr,
    relationship
)


class UserMixin:

    @declared_attr
    def user_actions(self) -> Mapped[list['UserAction']]:  # noqa F821
        return relationship(
            back_populates='user'
        )
