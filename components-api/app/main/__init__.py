#!/usr/bin/env python3

# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

import os

from flask import Flask

from tol.api_base2 import (
    data_blueprint,
    system_blueprint
)
from tol.core import core_data_object
from tol.elastic import ElasticDataSource


def application():
    app = Flask(__name__)
    eds = ElasticDataSource({'uri': os.getenv('ELASTIC_URI'),
                             'user': os.getenv('ELASTIC_USER'),
                             'password': os.getenv('ELASTIC_PASSWORD'),
                             'index_prefix': os.getenv('ELASTIC_INDEX_PREFIX')})
    datasources = [eds]
    core_data_object(*datasources)
    blueprint_data = data_blueprint(eds)
    app.register_blueprint(blueprint_data, url_prefix='/api/v1')
    blueprint_system = system_blueprint(eds)
    app.register_blueprint(blueprint_system, url_prefix='/api/v1/system')
    return app
