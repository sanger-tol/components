
# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from typing import Any

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class PipelineStep(Base):
    __tablename__ = 'pipeline_steps'
    __table_args__ = (
        UniqueConstraint(
            'pipeline_id',
            'stage',
            'step_order',
            name='uq_pipeline_stage_step_order'
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
    pipeline_id: Mapped[int] = mapped_column(ForeignKey('pipeline.id'), nullable=False)
    step_name: Mapped[str] = mapped_column(nullable=False)
    stage: Mapped[int] = mapped_column(nullable=False)
    step_order: Mapped[int] = mapped_column(nullable=False)
    config: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default={}
    )

    pipeline: Mapped['Pipeline'] = \
        relationship('Pipeline', back_populates='steps')  # noqa F821
