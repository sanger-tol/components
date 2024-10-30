/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/auth.context';
import { Loader } from '../index';
import {getProfile, getRoles, getToken} from '../services/auth/authService';
import { useQuery } from '../hooks/useQuery';
import { setTokenToLocalStorage, setUserToLocalStorage, tokenHasExpired } from '../services/localStorage/localStorageService';

export function Callback() {
  const history = useHistory();
  const { setToken, token, setUser } = useAuth();
  const [state] = useState(useQuery().get('state') || undefined);
  const [tokenCode] = useState(useQuery().get('code') || undefined);

  useEffect(() => {
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
              let targetUrl = localStorage.getItem('returnUrl') || '';
              console.log("history", history);
              if (!targetUrl || targetUrl === 'index') {
                targetUrl = '/maps';
              }
              history.replace(targetUrl);
            });
        })
        .catch(() => { 
          history.replace('/login');
        });
    }
    // eslint-disable-next-line
  }, []);

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

export default Callback;