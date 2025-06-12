# SPDX-FileCopyrightText: 2025 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Upload(Base):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003
    s3_url: Mapped[str] = mapped_column()
    s3_filename: Mapped[str] = mapped_column()
    spreadsheet_config: Mapped[str] = mapped_column()
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'))
    pipeline_name: Mapped[str] = mapped_column(ForeignKey('pipeline.pipeline_name'))
    destination: Mapped[str] = mapped_column()
    flow_run_id: Mapped[str] = mapped_column()
    date: Mapped[datetime.datetime] = mapped_column()
    results: Mapped[JSONB] = mapped_column()
    complete: Mapped[bool] = mapped_column(default=False)

    user: Mapped['User'] = relationship('User', back_populates='uploads') # noqa F821
    pipeline: Mapped['Pipeline'] = relationship('Pipeline', back_populates='uploads')  # noqa F821
