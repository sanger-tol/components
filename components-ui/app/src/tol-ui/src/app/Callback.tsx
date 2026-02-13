/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
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
  PSmartApp,
} from "..";

export function Callback(props: PSmartApp) {
  const { brand } = props;

  const history = useHistory();

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
        const token = res.data.access_token;
        setTokenToLocalStorage(token);
        setToken(token);
        getProfile(token)
          .then((profileData: any) => {
            getRoles().then((rolesData: any) => {
              const userData = { ...profileData.data, ...rolesData.data };
              setUserToLocalStorage(userData);
              setUser(userData);
            });
          })
          .finally(() => {
            setTimeout(() => {
              const targetUrl = getReturnUrlFromLocalStorage() || "";
              history.replace(targetUrl);
            }, 500);
          });
      });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <LoadingContent
      brand={brand}
      overlayNav
      text="Logging in..."
    />
  );
}
