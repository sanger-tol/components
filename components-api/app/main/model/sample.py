# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Sample(Base):
    __tablename__ = 'sample'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
    tube_id: Mapped[str] = mapped_column()
    acceptance_status: Mapped[str] = mapped_column()
    risk_status: Mapped[str] = mapped_column()
    shipping_status: Mapped[str] = mapped_column()

    specimen_id: Mapped[int] = mapped_column(
        ForeignKey('specimen.id'),
        nullable=False
    )
    specimen: Mapped['Specimen'] \
        = relationship(back_populates='samples') # noqa F821
