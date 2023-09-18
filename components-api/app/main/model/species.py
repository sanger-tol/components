# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from typing import List

from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Species(Base):
    __tablename__ = 'species'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
    name: Mapped[str] = mapped_column()
    scientific_name: Mapped[str] = mapped_column()
    genus: Mapped[str] = mapped_column()
    family: Mapped[str] = mapped_column()

    specimens: Mapped[List['Specimen']] = \
        relationship(back_populates='species')  # noqa F821
