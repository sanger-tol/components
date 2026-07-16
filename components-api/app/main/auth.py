# SPDX-FileCopyrightText: 2026 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

from flask import request

from tol.api_base.auth import AuthInspector
from tol.api_base.auth.error import ForbiddenError
from tol.api_base.misc.auth_context import CtxGetter, default_ctx_getter
from tol.core.operator import OperatorMethod


def get_auth_inspector(
    expected_api_token: str,
    ctx_getter: CtxGetter = default_ctx_getter
) -> AuthInspector:
    """
    Returns a `AuthInspector` `Callable` that
    requires admin on fetching manifest_submissions
    """

    def auth_inspector(
        object_type: str,
        method: OperatorMethod,
        *args,
        **kwargs
    ) -> None:
        given_api_token = request.headers.get('token')
        if expected_api_token is not None and expected_api_token == given_api_token:
            return
        raise ForbiddenError()

    return auth_inspector


def get_boards_auth_inspector(
    ctx_getter: CtxGetter = default_ctx_getter
) -> AuthInspector:
    """
    Returns a `AuthInspector` `Callable` that
    required authentication on board queries
    """
    write_methods = (  # noqa N806
        OperatorMethod.DELETE,
        OperatorMethod.INSERT,
        OperatorMethod.UPDATE,
        OperatorMethod.UPSERT
    )
    board_object_types = ('board', 'component', 'zone', 'view',
                          'component_zone', 'zone_view', 'view_board')

    def auth_inspector(
        object_type: str,
        method: OperatorMethod,
        *args,
        **kwargs
    ) -> None:

        if object_type not in board_object_types:
            return
        if method not in write_methods:
            return

        ctx = ctx_getter()

        if not ctx.authenticated:
            raise ForbiddenError()

        if 'warden' in ctx.roles:
            return

        return {'user.id': {'eq': {'value': ctx.user_id}}}

    return auth_inspector


def get_local_auth_inspector(
    ctx_getter: CtxGetter = default_ctx_getter
) -> AuthInspector:

    WRITE_METHODS = (  # noqa N806
        OperatorMethod.DELETE,
        OperatorMethod.INSERT,
        OperatorMethod.UPDATE,
        OperatorMethod.UPSERT
    )

    def auth_inspector(
        object_type: str,
        method: OperatorMethod,
        *args,
        **kwargs
    ) -> None:

        # Non-admin users can only see their own uploads,
        # unauthenticated users cannot see uploads at all
        if object_type == 'upload' and 'admin' not in ctx_getter().roles:
            return {'user.id': {'eq': {'value': ctx_getter().user_id}}}

        if method not in WRITE_METHODS:
            return

        if not ctx_getter().authenticated:
            raise ForbiddenError()

    return auth_inspector
