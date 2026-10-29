/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IUser } from "../..";


export function setTokenToLocalStorage(token: string) {
  localStorage.setItem("token", token);
}

export function getTokenFromLocalStorage() {
  return localStorage.getItem("token") || "";
}

export function setUserToLocalStorage(user: IUser | null) {
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

/**
 * Reads a value from localStorage using a dot path, where the first segment is the storage key
 * and any remaining segments traverse the JSON-parsed value (e.g. `user.id`).
 *
 * @param path - Dot path to the value, such as `user.id`.
 * @returns The value at the path, or `undefined` if it is missing or cannot be parsed.
 */
export function getValueFromLocalStoragePath(path: string): unknown {
  const [key, ...segments] = path.split(".");
  const raw = localStorage.getItem(key);
  if (raw === null) return undefined;
  if (segments.length === 0) return raw;
  try {
    return segments.reduce<any>((value, segment) => value?.[segment], JSON.parse(raw));
  } catch {
    return undefined;
  }
}
