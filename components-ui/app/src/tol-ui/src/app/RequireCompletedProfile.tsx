/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { TolLoader, PopUpMessage, useFormData, useAuth, LOCAL_DS } from "..";
import type { TUserProfileFormDataOrNull } from "..";

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
 * Guards protected content until the current user has completed their profile.
 *
 * Once profile loading has finished, users without the required profile fields
 * are shown an informational message and redirected to the profile page. The
 * current pathname is preserved in router state so the profile form can return
 * the user to their original destination after a successful save.
 *
 * While the profile is still loading, or while the redirect is pending,
 * children are not rendered.
 *
 * @param props - The guard configuration and wrapped protected content.
 * @returns The protected children when the profile is complete; otherwise a
 * loading indicator while profile state is resolving or redirecting.
 */
export function RequireCompletedProfile(props: PRequireCompletedProfile) {
  const { redirectTo = "/profile", children } = props;
  const { user } = useAuth();
  const { meetsCondition: hasCompletedProfile, isLoading } =
    useFormData<TUserProfileFormDataOrNull>({
      formName: "userProfile",
      dataSource: LOCAL_DS,
      objectType: "user",
      andFilter: { id: { eq: { value: user?.id } } },
      enabledCondition: !!user?.id,
      isComplete: (data) => !!data?.email && !!data?.name,
    });
  const location = useLocation();
  const history = useHistory();

  // Stops infinite redirect loops if the redirect target is the current page
  const isRedirectTarget = location.pathname === redirectTo;

  useEffect(() => {
    if (isRedirectTarget) return;
    if (!isLoading && !hasCompletedProfile) {
      PopUpMessage({
        type: "info",
        message: "You must have a completed profile to access this page.",
      });
      history.replace({
        pathname: redirectTo,
        state: { from: location.pathname },
      });
    }
  }, [
    isRedirectTarget,
    isLoading,
    hasCompletedProfile,
    redirectTo,
    history,
    location.pathname,
  ]);

  if (!isRedirectTarget && (isLoading || !hasCompletedProfile))
    return <TolLoader content="Loading Content..." vertical size="md" />;

  return <>{children}</>;
}
