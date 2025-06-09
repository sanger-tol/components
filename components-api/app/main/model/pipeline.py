# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Pipeline(Base):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
    pipeline_name: Mapped[str] = mapped_column(unique=True)

    uploads: Mapped[list['Upload']] = \
        relationship('Upload', back_populates='pipeline') # noqa F821
    steps: Mapped[list['PipelineSteps']] = \
        relationship('PipelineSteps', back_populates='pipeline')  # noqa F821
