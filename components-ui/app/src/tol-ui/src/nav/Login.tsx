/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useCallback, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/auth.context';
import { getUrlLogin } from '../services/auth/authService';
import { tokenHasExpired } from '../services/localStorage/localStorageService';
import { LoginIcon } from '../general/Icons';


function Login() {
  const { setToken } = useAuth();

  useEffect(() => {
    if (tokenHasExpired()) setToken('');
  }, []);

  const login = useCallback(() => {
    getUrlLogin().then((data: any) => {
      window.location.href = data.data.loginUrl;
    });
  }, []);

  return (tokenHasExpired()) ? (
    LoginIcon(login)
  ) : (
    <Redirect to="/" />
  );
}

export default Login;