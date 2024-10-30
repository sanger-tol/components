/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/auth.context';
import { Redirect } from "react-router-dom";
import { Loader } from '../index';
import { getProfile, getRoles, getToken } from '../services/auth/authService';
import { useQuery } from '../hooks/useQuery';
import {
  getReturnUrlFromLocalStorage,
  setTokenToLocalStorage,
  setUserToLocalStorage,
  tokenHasExpired
} from '../services/localStorage/localStorageService';

export function Callback() {
  const { setToken, token, setUser } = useAuth();
  const [state] = useState(useQuery().get('state') || undefined);
  const [tokenCode] = useState(useQuery().get('code') || undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!state || !tokenCode) {
      setError(true);
      return;
    }

    if (!token || tokenHasExpired()) {
      const stateToken = {
        state,
        code: tokenCode,
      };
      getToken(stateToken)
        .then((res: any) => {
          const tokenData = res.data;
          setTokenToLocalStorage(tokenData.access_token);
          setToken(tokenData.access_token);
          getProfile(tokenData.access_token)
            .then((profileData: any) => {
              getRoles().then((rolesData: any) => {
                const userData = { ...profileData.data, ...rolesData.data };
                setUserToLocalStorage(userData);
                setUser(userData);
              });
            })
            .finally(() => {
              setLoading(false);
            });
        })
    }
    // eslint-disable-next-line
  }, []);

  if (error) {
    return <Redirect to='/page-not-found' />
  }

  if (loading) {
    return (
      <div className='fixed-full-page'>
        <div className='fixed-centered-loader'>
          <Loader />
        </div>
        <div className='fixed-centered-text'>
          Logging in...
        </div>
      </div>
    );
  }

  return <Redirect to={getReturnUrlFromLocalStorage()} />
}

export default Callback;