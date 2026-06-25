/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  TPageAccess,
  URL_PATHS,
  useAuth,
  userMeetsRoleRequirement,
} from "..";

export interface PRequireRole {
  /**
   * The access level to enforce. Either `role_required` (any role) or an array
   * of role names, one of which the user must hold.
   */
  access: TPageAccess;
  /**
   * The content to render once the user is confirmed to hold the required role.
   */
  children: React.ReactNode;
}

/**
 * Guards protected content behind a role requirement.
 *
 * Intended to run inside `RequireAuth` and `RequireCompletedProfile`, so by the
 * time it renders the user is already authenticated. If the authenticated user
 * does not hold the required role, they are redirected to the page-not-found
 * route, matching the behaviour of a route that does not exist.
 *
 * The user (and their roles) is read synchronously from local storage, so no
 * loading state is required here.
 *
 * @param props - The required access level and wrapped protected content.
 * @returns The protected children when the role requirement is met; otherwise
 * `null` while the redirect is pending.
 */
export function RequireRole(props: PRequireRole) {
  const { access, children } = props;
  const { user } = useAuth();
  const history = useHistory();

  const hasRequiredRole = userMeetsRoleRequirement(user, access);

  useEffect(() => {
    if (!hasRequiredRole) {
      history.replace(URL_PATHS.PAGE_NOT_FOUND);
    }
  }, [hasRequiredRole, history]);

  if (!hasRequiredRole) return null;

  return <>{children}</>;
}
