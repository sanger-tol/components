# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from typing import Any
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Pipeline(Base):
    __tablename__ = 'pipeline'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
    name: Mapped[str] = mapped_column(nullable=False, unique=True)
    source: Mapped[dict[str, Any]] = mapped_column(nullable=False, default={})
    destination: Mapped[dict[str, Any] | None] = mapped_column()

    uploads: Mapped[list['Upload']] = \
        relationship('Upload', back_populates='pipeline') # noqa F821
    steps: Mapped[list['PipelineSteps']] = \
        relationship('PipelineSteps', back_populates='pipeline')  # noqa F821
