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
    pipeline_steps_blueprint,
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
from tol.sources.portal import portal
from tol.sql import Model, create_sql_datasource
from tol.sql.auth import db_auth_blueprint
from tol.sql.pipeline_step import create_pipeline_step_models
from tol.sql.standard import create_standard_models
from tol.status import StatusDataSource

from .auth import (
    get_auth_inspector,
    get_boards_auth_inspector,
    get_local_auth_inspector
)
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


def __get_standard_models(
    base_model: type[Model],
) -> tuple[list[type[Model]], type[Model]]:

    standard_models = create_standard_models(base_model)

    return list(standard_models), standard_models._user_mixin


def __get_pipeline_step_models(
    base_model: type[Model],
) -> tuple[list[type[Model]], type[Model]]:
    pipeline_models = create_pipeline_step_models(base_model)

    return list(pipeline_models), pipeline_models._user_mixin


def application():
    app = Flask(__name__)

    # the user-configurable dashboards
    standard_models, _board_user_mixin = __get_standard_models(Base)

    # the pipeline, steps, and uploads models
    pipeline_models, _pipeline_user_mixin = __get_pipeline_step_models(Base)

    # the user Mixin
    user_mixin_class = type(
        '',
        (UserMixin,
         _board_user_mixin,
         _pipeline_user_mixin),
        {}
    )

    # authentication and authorisation
    auth_bp = db_auth_blueprint(
        Base,
        os.environ['DB_URI'],
        url_prefix=os.getenv('API_PATH') + '/auth',
        oidc_id_target='email',
        user_mixin_class=user_mixin_class
    )
    app.register_blueprint(auth_bp)
    auth_bp.register_authenticator(app)

    models = [
        *MODELS,
        auth_bp.models.user_class,
        *standard_models,
        *pipeline_models,
    ]

    # Set up datasource
    sql_datasource = create_sql_datasource(
        models=models,
        db_uri=os.getenv('DB_URI')
    )
    core_data_object(sql_datasource)

    # Playwright
    playwright_ds = PlaywrightTestDataSource()
    core_data_object(playwright_ds)

    # Portal
    portal_ds = portal()

    # Combined data endpoints
    blueprint_data = data_blueprint(
        playwright_ds,
        portal_ds,
        url_prefix=os.environ['API_PATH']
    )
    app.register_blueprint(
        blueprint_data,
        name='data'
    )

    # Data endpoints
    blueprint_data_local = data_blueprint(
        sql_datasource,
        auth_inspector=get_local_auth_inspector()
    )
    app.register_blueprint(blueprint_data_local, name='local',
                           url_prefix=os.getenv('API_PATH') + '/local')

    # status board
    status_ds = StatusDataSource({})
    core_data_object(status_ds)

    blueprint_data_status = data_blueprint(
        status_ds,
        auth_inspector=get_auth_inspector(os.getenv('API_TOKEN'))
    )
    app.register_blueprint(blueprint_data_status, name='status_ds',
                           url_prefix=os.getenv('API_PATH') + '/status')

    # The system endpoints
    blueprint_system = system_blueprint()
    app.register_blueprint(blueprint_system, url_prefix=os.getenv('API_PATH') + '/system')

    # user id
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
        url_prefix=os.getenv('API_PATH') + '/local/run-action'
    )

    # pipelines
    pipeline_steps_bp = pipeline_steps_blueprint(
        sql_datasource,
        __mock_prefect_ds(),
        role=None
    )
    app.register_blueprint(
        pipeline_steps_bp,
        url_prefix=os.environ['API_PATH'] + '/run-pipeline'
    )

    # dashboards
    boards_bp = board_blueprint(sql_datasource)
    app.register_blueprint(
        boards_bp,
        url_prefix=os.environ['API_PATH'] + '/boards'
    )
    blueprint_board_data = data_blueprint(sql_datasource,
                                          auth_inspector=get_boards_auth_inspector())
    app.register_blueprint(
        blueprint_board_data,
        url_prefix=os.getenv('API_PATH') + '/boards'
    )

    return app
