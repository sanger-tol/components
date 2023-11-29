#!/usr/bin/env python3

# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

import os

from flask import Flask

from tol.sql.models import (
    Auth,
    User,
    State
)
from tol.api_base2 import (
    auth_blueprint,
    data_blueprint,
    system_blueprint
)
from tol.api_base2.misc import (
    quick_and_dirty_auth
)
from tol.core import core_data_object
from tol.sql import create_sql_datasource

from .model import Sample, Species, Specimen


def application():
    app = Flask(__name__)

    # Set up datasource
    sql_datasource = create_sql_datasource(
        models=[Species, Specimen, Sample, Auth, User, State],
        db_uri=os.getenv('DB_URI')
    )
    core_data_object(sql_datasource)

    # Data endpoints
    authenticator = quick_and_dirty_auth(omnipotent_token=os.getenv('API_TOKEN'))
    blueprint_data_local = data_blueprint(sql_datasource, authenticator=authenticator)
    app.register_blueprint(blueprint_data_local, name='local',
                           url_prefix=os.getenv('API_PATH'))

    # The system endpoints
    blueprint_system = system_blueprint(sql_datasource)
    app.register_blueprint(blueprint_system, url_prefix=os.getenv('API_PATH') + '/system')
    
    # The auth endpoints
    blueprint_auth = auth_blueprint(sql_datasource)
    app.register_blueprint(blueprint_auth, url_prefix=os.getenv('API_PATH') + '/auth')

    return app
