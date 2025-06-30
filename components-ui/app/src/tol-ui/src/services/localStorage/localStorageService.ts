/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { User } from "../..";


export function setTokenToLocalStorage(token: string) {
  localStorage.setItem("token", token);
}

export function getTokenFromLocalStorage() {
  return localStorage.getItem("token") || "";
}

export function setUserToLocalStorage(user: User | null) {
  if (user === null) {
    localStorage.setItem("user", "");
  }
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUserFromLocalStorage() {
  const userString = localStorage.getItem("user") || '{"roles": []}';
  return JSON.parse(userString);
}

export function tokenHasExpired() {
  const token = getTokenFromLocalStorage();
  if (!token) return true;
  try {
    const user = getUserFromLocalStorage();
    const expiryUTC = user.token_expires_at;
    const nowUTC = new Date().toISOString();
    return nowUTC >= expiryUTC;
  } catch (e) {
    return true;
  }
}

export function setReturnUrlFromLocalStorage (url: string) {
  if (url !== "/callback") {
    localStorage.setItem("returnUrl", url);
  }
};

export function getReturnUrlFromLocalStorage() {
  return localStorage.getItem("returnUrl") || "/";
};
