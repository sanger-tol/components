#!/usr/bin/env python3

# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

import os

from flask import Flask

from tol.api_base2 import data_blueprint
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
    blueprint = data_blueprint(eds)
    app.register_blueprint(blueprint, url_prefix='/api/v1')
    return app
