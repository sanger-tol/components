/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { User } from '../../models/User';

export function setTokenToLocalStorage(token: string) {
  localStorage.setItem('token', token);
}

export function getTokenFromLocalStorage() {
  return localStorage.getItem('token') || '';
}

export function setUserToLocalStorage(user: User|null) {
  if (user === null) {
    localStorage.setItem('user', '');
  }
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUserFromLocalStorage() {
  const userString = localStorage.getItem('user') || '{"roles": []}';
  return JSON.parse(userString);
}

export function tokenHasExpired() {
  const token = getTokenFromLocalStorage();
  if (!token) return true;

  try {
    const user = getUserFromLocalStorage();
    const expires_at = Date.parse(user.expires_at);

    return expires_at < Date.now();

  } catch (e) {
    return true;
  }
}