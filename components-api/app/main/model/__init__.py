# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from .action import Action
from .base import Base  # noqa
from .sample import Sample
from .singular import Singular
from .species import Species
from .specimen import Specimen
from .user_action import UserAction
from .user_mixin import UserMixin  # noqa


MODELS = [
    Action,
    Sample,
    Singular,
    Species,
    Specimen,
    UserAction,
]
