# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from flask import Blueprint

from flask_restx import Api

from tol.api_base.auth import authorizations
from tol.api_base.resource import api_auth, api_environment, api_user

from ..resource import api_sample, api_species, api_specimen


def _get_environment_string(app):
    environment = app.config['DEPLOYMENT_ENVIRONMENT']
    if environment == 'production':
        return ''
    return f' ({environment})'


def _setup_api(blueprint, app):
    api = Api(
        blueprint,
        doc='/ui',
        title=f'Tree of Life Quality Control{_get_environment_string(app)}',
        authorizations=authorizations
    )
    api.add_namespace(api_auth)
    api.add_namespace(api_environment)
    api.add_namespace(api_user)
    api.add_namespace(api_sample)
    api.add_namespace(api_specimen)
    api.add_namespace(api_species)


def init_blueprints(app):
    blueprint = Blueprint('api', __name__, url_prefix='/api/v1')
    _setup_api(blueprint, app)
    return blueprint
