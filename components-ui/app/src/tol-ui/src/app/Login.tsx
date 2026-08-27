/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useCallback, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import {
  useAuth,
  getUrlLogin,
  getReturnUrlFromLocalStorage,
  setReturnUrlFromLocalStorage,
  tokenHasExpired,
} from "..";


interface Props {
  buttonIcon: any;
  returnUrl?: string;
}

export function Login(props: Props) {
  const { buttonIcon, returnUrl } = props;
  const { setToken, setUser } = useAuth();

  useEffect(() => {
    if (tokenHasExpired()) setToken("");
  }, []);

  const login = useCallback(() => {
  setReturnUrlFromLocalStorage(returnUrl || window.location.pathname);
  getUrlLogin().then((data) => {
    //@ts-ignore
    setUser(data.userData);
    if (Capacitor.isNativePlatform()) {
      // On Android, close any existing browser before opening a new one to prevent duplicates
      Browser.close().catch(() => {}).then(() => {
        Browser.open({ url: data.loginUrl }).catch(() => {
          // Fallback: redirect in-app if browser open fails
          //@ts-ignore
          window.location.href = data.loginUrl;
        });
      });
    } else {
      //@ts-ignore
      window.location.href = data.loginUrl;
    }
  });
}, []);

  return tokenHasExpired() ? (
    buttonIcon(login)
  ) : (
    <Redirect to={getReturnUrlFromLocalStorage() || "/"} />
  );
}
