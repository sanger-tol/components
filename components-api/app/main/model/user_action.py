# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class UserAction(Base):
    __tablename__ = 'user_action'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)  # noqa A003

    params: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default={}
    )
    created_at: Mapped[datetime] = mapped_column(
        nullable=False,
        default=datetime.now
    )

    action_id: Mapped[int] = mapped_column(
        ForeignKey('action.id'),
        nullable=False
    )
    action: Mapped['Action'] = relationship(  # noqa F821
        back_populates='user_actions',
        foreign_keys=[action_id]
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey('user.id'),
        nullable=False
    )
    user: Mapped['User'] = relationship(  # noqa F821
        back_populates='user_actions',
        foreign_keys=[user_id]
    )
