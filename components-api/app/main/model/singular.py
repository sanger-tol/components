# SPDX-FileCopyrightText: 2024 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Singular(Base):
    __tablename__ = 'singular'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
