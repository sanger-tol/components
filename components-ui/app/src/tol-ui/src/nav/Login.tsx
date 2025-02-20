/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useCallback, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { useAuth } from "../contexts/auth.context";
import { getUrlLogin } from "../services/auth/authService";
import {
  getReturnUrlFromLocalStorage,
  setReturnUrlFromLocalStorage,
  tokenHasExpired,
} from "../services/localStorage/localStorageService";

interface Props {
  buttonIcon: React.ReactNode;
  returnUrl?: string;
}

function Login(props: Props) {
  const { buttonIcon, returnUrl } = props;
  const { setToken, setUser } = useAuth();

  useEffect(() => {
    if (tokenHasExpired()) setToken("");
  }, []);

  const login = useCallback(() => {
    setReturnUrlFromLocalStorage(returnUrl || window.location.pathname);
    getUrlLogin().then((data) => {
      //@ts-expect-error
      setUser(data.userData);
      //@ts-expect-error
      window.location.href = data.loginUrl;
    });
  }, []);
  // @ts-expect-error
  return tokenHasExpired() ? (
    buttonIcon(login)
  ) : (
    <Redirect to={getReturnUrlFromLocalStorage() || "/"} />
  );
}

export default Login;
