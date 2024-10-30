/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useCallback, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { useAuth } from "../contexts/auth.context";
import { getUrlLogin } from "../services/auth/authService";
import { tokenHasExpired } from "../services/localStorage/localStorageService";
import { setLocalStorageReturnUrl } from "../general/Utils";
interface Props {
  buttonIcon: JSX.Element;
  returnUrl?: string;
}

function Login(props: Props) {
  const {buttonIcon, returnUrl} = props;

  const { setToken } = useAuth();

  useEffect(() => {
    if (tokenHasExpired()) setToken("");
  }, []);

  const login = useCallback(() => {
    setLocalStorageReturnUrl(returnUrl ?? window.location.pathname);
    getUrlLogin().then((data: any) => {
      window.location.href = data.data.loginUrl;
    });
  }, []);

  return tokenHasExpired() ? buttonIcon(login) : <Redirect to="/" />;
}

export default Login;