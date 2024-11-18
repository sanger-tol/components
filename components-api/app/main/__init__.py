#!/usr/bin/env python3

# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

import os

from flask import Blueprint, Flask

from tol.api_base2 import (
    data_blueprint,
    system_blueprint
)
from tol.api_base2.misc import default_ctx_getter
from tol.core import core_data_object
from tol.sql import Model, create_sql_datasource
from tol.sql.auth import db_auth_blueprint
from tol.sql.board import create_board_models

from .model import Base, Sample, Singular, Species, Specimen


def __user_id_blueprint(api_path: str) -> None:
    user_bp = Blueprint(
        'user_id',
        __name__,
        url_prefix=f'{api_path}/user_id'
    )

    @user_bp.get('')
    def get():
        ctx = default_ctx_getter()

        return {
            'userId': ctx.user_id,
            'roles': ctx.roles
        }, 200

    return user_bp


def __get_board_models(
    base_model: type[Model],
) -> tuple[list[type[Model]], type[Model]]:

    board_models = create_board_models(base_model)

    return list(board_models), board_models._user_mixin


def application():
    app = Flask(__name__)

    # the user-configurable dashboards
    board_models, user_mixin_class = __get_board_models(Base)

    # authentication and authorisation
    auth_bp = db_auth_blueprint(
        Base,
        os.environ['DB_URI'],
        url_prefix=os.getenv('API_PATH') + '/auth',
        oidc_id_target='id',
        user_mixin_class=user_mixin_class
    )
    app.register_blueprint(auth_bp)
    auth_bp.register_authenticator(app)

    models = [
        Species,
        Specimen,
        Sample,
        Singular,
        auth_bp.models.user_class,
        *board_models
    ]

    # Set up datasource
    sql_datasource = create_sql_datasource(
        models=models,
        db_uri=os.getenv('DB_URI')
    )
    core_data_object(sql_datasource)

    # Data endpoints
    blueprint_data_local = data_blueprint(sql_datasource)
    app.register_blueprint(blueprint_data_local, name='local',
                           url_prefix=os.getenv('API_PATH'))

    # The system endpoints
    blueprint_system = system_blueprint()
    app.register_blueprint(blueprint_system, url_prefix=os.getenv('API_PATH') + '/system')

    user_id_bp = __user_id_blueprint(os.environ['API_PATH'])
    app.register_blueprint(user_id_bp)

    return app
