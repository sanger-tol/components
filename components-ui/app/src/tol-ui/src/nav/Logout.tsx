/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from 'react';
import { useAuth } from '../contexts/auth.context';
import { tokenHasExpired } from '../services/localStorage/localStorageService';


function Logout() {
  const { setToken } = useAuth();

  const handleVisibilityChange = () => {
    setToken('');
  };

  useEffect(() => {
    if (tokenHasExpired()) handleVisibilityChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <>Logout</>;
}

export default Logout;