# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from datetime import datetime
from typing import Any, Dict, List

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Upload(Base):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
    s3_url: Mapped[str] = mapped_column(nullable=False)
    s3_filename: Mapped[str] = mapped_column(nullable=False)
    spreadsheet_config: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    pipeline_name: Mapped[str] = mapped_column(ForeignKey('pipeline.name'), nullable=False)
    destination: Mapped[str] = mapped_column(nullable=False)
    flow_run_id: Mapped[str] = mapped_column(nullable=True)
    date_started: Mapped[datetime] = mapped_column(default=datetime.now, nullable=False)
    results: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, nullable=False, default=[])
    completed: Mapped[bool] = mapped_column(nullable=False, default=False)

    user: Mapped['User'] = relationship('User', back_populates='uploads') # noqa F821
    pipeline: Mapped['Pipeline'] = relationship('Pipeline', back_populates='uploads')  # noqa F821
