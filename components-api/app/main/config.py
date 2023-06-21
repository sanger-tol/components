# SPDX-FileCopyrightText: 2023 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

import logging
import os


def _get_environment_env():
    deployment_environment = os.getenv('ENVIRONMENT', '')
    if deployment_environment != '':
        return deployment_environment

    # if unset, assume dev
    logging.warning("$ENVIRONMENT is unset - assuming a 'dev' environment")
    return 'dev'


def set_config(app, encoder):
    app.config['DEPLOYMENT_ENVIRONMENT'] = _get_environment_env()
    app.config['PROPAGATE_EXCEPTIONS'] = True
