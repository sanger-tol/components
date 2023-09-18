# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from typing import List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Specimen(Base):
    __tablename__ = 'specimen'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
    tolid: Mapped[str] = mapped_column()
    is_complex: Mapped[bool] = mapped_column()
    ready: Mapped[bool] = mapped_column()

    samples: Mapped[List['Sample']] = relationship(back_populates='specimen')  # noqa F821

    species_id: Mapped[int] = mapped_column(
        ForeignKey('species.id'),
        nullable=False
    )
    species: Mapped['Species'] \
        = relationship(back_populates='specimens') # noqa F821
