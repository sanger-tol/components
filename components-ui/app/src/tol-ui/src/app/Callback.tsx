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
  PSmartApp,
  PopUpMessage,
} from "..";

export function Callback(props: PSmartApp) {
  const { brand } = props;

  const history = useHistory();

  const { setToken, setUser } = useAuth();
  const [state] = useState(useQuery().get("state") || undefined);
  const [tokenCode] = useState(useQuery().get("code") || undefined);
  const [loginError, setLoginError] = useState<any>(null);

  useEffect(() => {
    const completeLogin = async () => {
      const stateToken = {
        state,
        code: tokenCode,
      };
      try {
        const res: any = await getToken(stateToken);
        const token = res.data.access_token;
        setTokenToLocalStorage(token);
        setToken(token);
        const profileData: any = await getProfile(token);
        const rolesData: any = await getRoles();
        const userData = { ...profileData.data, ...rolesData.data };
        setUserToLocalStorage(userData);
        setUser(userData);
        setTimeout(() => {
          const targetUrl = getReturnUrlFromLocalStorage() || "";
          history.replace(targetUrl);
        }, 500);
      } catch (error) {
        console.error("Unable to complete login callback", error);
        PopUpMessage({ type: 'error', message: error.message || String(error) });
        setLoginError(error);
      }
    };

    void completeLogin();
    // eslint-disable-next-line
  }, []);

  if (loginError) {
    return (<p>{loginError?.message || String(loginError)}</p>)
  }

  return (
    <LoadingContent
      brand={brand}
      overlayNav
      text="Logging in..."
    />
  );
}
