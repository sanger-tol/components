#!/usr/bin/env python3

# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

import json
import logging
import os
from unittest.mock import create_autospec

from flask import Blueprint, Flask

from tol.api_base import (
    action_blueprint,
    data_blueprint,
    system_blueprint
)
from tol.api_base.misc import default_ctx_getter
from tol.board import board_blueprint
from tol.core import (
    DataSource,
    OperableDataSource,
    core_data_object
)
from tol.core.operator import Inserter
from tol.sql import Model, create_sql_datasource
from tol.sql.auth import db_auth_blueprint
from tol.sql.board import create_board_models

from .model import Base, MODELS, UserMixin
from .playwright_ds import PlaywrightTestDataSource


def __user_id_blueprint(api_path: str) -> Blueprint:
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


def __mock_prefect_ds() -> OperableDataSource:
    _PrefectDS = type(  # noqa
        '',
        (DataSource, Inserter),
        {}
    )

    prefect_ds: _PrefectDS = create_autospec(
        _PrefectDS,
        spec_set=True
    )

    def __factory(
        __type: str,
        id_=None,
        attributes={},
        **kwargs
    ) -> None:

        # this needs to be `error()` to appear in the server logs
        logging.error(
            json.dumps(attributes, indent=2)
        )

    prefect_ds.supported_types = ['flow_run']
    prefect_ds.data_object_factory.side_effect = __factory

    return prefect_ds


def __get_board_models(
    base_model: type[Model],
) -> tuple[list[type[Model]], type[Model]]:

    board_models = create_board_models(base_model)

    return list(board_models), board_models._user_mixin


def application():
    app = Flask(__name__)

    # the user-configurable dashboards
    board_models, _board_user_mixin = __get_board_models(Base)

    # the user Mixin
    user_mixin_class = type(
        '',
        (UserMixin, _board_user_mixin),
        {}
    )

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
        *MODELS,
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
    blueprint_data_local = data_blueprint(
        sql_datasource,
    )
    app.register_blueprint(blueprint_data_local, name='local',
                           url_prefix=os.getenv('API_PATH') + '/local')

    blueprint_data_playwright = data_blueprint(
        PlaywrightTestDataSource()
    )
    app.register_blueprint(
        blueprint_data_playwright,
        name='playwright',
        url_prefix=os.environ['API_PATH'] + '/playwright'
    )

    # The system endpoints
    blueprint_system = system_blueprint()
    app.register_blueprint(blueprint_system, url_prefix=os.getenv('API_PATH') + '/system')

    # user ID
    user_id_bp = __user_id_blueprint(os.environ['API_PATH'])
    app.register_blueprint(user_id_bp)

    # actions
    actions_bp = action_blueprint(
        sql_datasource,
        __mock_prefect_ds(),
        role=None
    )
    app.register_blueprint(
        actions_bp,
        url_prefix=os.environ['API_PATH'] + '/run-action'
    )

    # dashboards
    boards_bp = board_blueprint(sql_datasource)
    app.register_blueprint(
        boards_bp,
        url_prefix=os.environ['API_PATH'] + '/boards'
    )
    blueprint_board_data = data_blueprint(sql_datasource)
    app.register_blueprint(blueprint_board_data, url_prefix=os.getenv('API_PATH') + '/board-data')

    return app
