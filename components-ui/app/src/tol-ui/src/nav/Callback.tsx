/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  LoadingContent,
  getProfile,
  getRoles,
  getToken,
  useQuery,
  useAuth,
  getReturnUrlFromLocalStorage,
  setTokenToLocalStorage,
  setUserToLocalStorage,
  tokenHasExpired,
} from "..";


export function Callback() {
  const { setToken, token, setUser } = useAuth();
  const [state] = useState(useQuery().get("state") || undefined);
  const [tokenCode] = useState(useQuery().get("code") || undefined);

  useEffect(() => {
    if (!token || tokenHasExpired()) {
      const stateToken = {
        state,
        code: tokenCode,
      };
      getToken(stateToken).then((res: any) => {
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
            setTimeout(() => {
              let targetUrl = getReturnUrlFromLocalStorage() || "";
              window.location.href = targetUrl;
            }, 500);
          });
      });
    }
    // eslint-disable-next-line
  }, []);

  return <LoadingContent text="Logging in..." />;
}
