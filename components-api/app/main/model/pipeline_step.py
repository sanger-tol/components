
# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class PipelineStep(Base):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
    pipeline_id: Mapped[int] = mapped_column(ForeignKey('pipeline.id'))
    step_name: Mapped[str] = mapped_column()
    stage_order: Mapped[str] = mapped_column()
    step_order: Mapped[int] = mapped_column()

    pipeline: Mapped['Pipeline'] = \
        relatiopnship('Pipeline', back_populates='steps')  # noqa F821
