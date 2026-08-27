/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import {
  getUrlLogin,
  setReturnUrlFromLocalStorage,
  tokenHasExpired,
} from "..";
import { useGlobalLoading } from "../hooks/useGlobalLoading";

export interface PRequireAuth {
  /**
   * The content to render once the user is confirmed authenticated.
   */
  children: React.ReactNode;
}

/**
 * Guards protected content behind the existing login flow.
 *
 * When the current token is missing or expired, this component stores the
 * current pathname as the post-login return URL, enables the global loading
 * state, and redirects the browser to the external login page.
 *
 * While unauthenticated, children are not rendered. This is important because
 * nested guards may perform their own redirects, which would overwrite the
 * original pathname before it can be preserved for the auth callback.
 *
 * @param props - The wrapped protected content.
 * @returns The protected children when authenticated; otherwise `null` while
 * the login redirect is being prepared.
 */
export function RequireAuth(props: PRequireAuth) {
  const { children } = props;
  const isExpired = tokenHasExpired();
  const { setGlobalLoading } = useGlobalLoading();
  const history = useHistory();

  useEffect(() => {
    if (!isExpired) return;

    setReturnUrlFromLocalStorage(window.location.pathname);

    if (Capacitor.isNativePlatform()) {
      // On native, redirect to home so the user triggers login via the Login button.
      // Auto-opening the auth URL here races with explicit login and causes double browser sessions.
      history.push("/");
    } else {
      setGlobalLoading(true);
      getUrlLogin().then((data) => {
        window.location.href = data.loginUrl;
      });
    }
  }, [isExpired, setGlobalLoading]);

  if (isExpired) return null;

  return <>{children}</>;
}
