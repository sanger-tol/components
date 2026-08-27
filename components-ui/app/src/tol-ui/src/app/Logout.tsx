/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useHistory } from "react-router-dom";
import {
  useAuth,
  setReturnUrlFromLocalStorage,
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  setUserToLocalStorage,
  API_PATHS,
} from "..";


export function useLogout() {
  const history = useHistory();
  const { setToken, setUser } = useAuth();

  const revokeOidc = (token: string) => {
    fetch(API_PATHS.API_PATH + "/auth/logout", {
      body: JSON.stringify({ token }),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  };

  return () => {
    setReturnUrlFromLocalStorage(window.location.pathname);

    const token = getTokenFromLocalStorage();
    if (token) revokeOidc(token);

    setTokenToLocalStorage("");
    setUserToLocalStorage(null);
    setToken("");
    setUser(null);
    
    // Clear auth callback state (Android-specific: sessionStorage persists across logout)
    sessionStorage.removeItem("auth_callback_processed_url");
    
    history.push("/");
  };
}
