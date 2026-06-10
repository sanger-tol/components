/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Redirect, useLocation } from "react-router-dom";
import { Loader, useUserProfile } from "..";

export interface PRequireCompletedProfile {
  /**
   * The route users with an incomplete profile are redirected to.
   */
  redirectTo?: string;
  /**
   * The content to render once the profile is confirmed complete.
   */
  children: React.ReactNode;
}

/**
 * Guard that only renders its children when the current user has a completed
 * profile. While the profile is loading a spinner is shown; users without a
 * completed profile are redirected to the profile setup page, with the
 * original location passed in router state so they can be returned there
 * after completing their profile.
 *
 * This is a UX guard only — any API endpoint that requires a completed
 * profile must also enforce that server-side.
 */
export function RequireCompletedProfile(props: PRequireCompletedProfile) {
  const { redirectTo = "/profile", children } = props;
  const { hasCompletedProfile, isLoading } = useUserProfile();
  const location = useLocation();

  if (isLoading) return <Loader />;

  if (!hasCompletedProfile) {
    return (
      <Redirect
        to={{ pathname: redirectTo, state: { from: location.pathname } }}
      />
    );
  }

  return <>{children}</>;
}
