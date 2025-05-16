/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { useAuth } from "../contexts/auth.context";
import {
  setReturnUrlFromLocalStorage,
  tokenHasExpired,
} from "../services/localStorage/localStorageService";

export function Logout() {
  const { setToken } = useAuth();

  setReturnUrlFromLocalStorage(window.location.pathname);

  const handleVisibilityChange = () => {
    setToken("");
  };

  useEffect(() => {
    if (tokenHasExpired()) {
      setReturnUrlFromLocalStorage(window.location.pathname);
      handleVisibilityChange();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return <>Logout</>;
}
