/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Page } from 'src/models';
import { httpClient } from '../http/httpClient';
import { tokenHasExpired } from '../localStorage/localStorageService';

export function getUrlLogin() {
  return httpClient().get('/auth/login').then(response => {
    return {
      loginUrl: response!.data!.loginUrl,
      userData: {
        name: response!.data!.name,
      }
    };
  });
}

export function getToken(dataPost: any) {
  return httpClient().post('/auth/token', dataPost);
}

export function getProfile(token: string) {
  return httpClient().post('/auth/profile', {token});
}

export function getRoles() {
  return httpClient().get('/auth/roles');
}

export function confirmAuthorised(user: any, auth?: boolean|string[], noAuth?: boolean) {
  // If a user is logged in and the page is set to hide when logged in
  if (noAuth && user) {
    return false
  }
  // Check if the user is logged in and the token has not expired if the page requires auth
  if (typeof auth === 'boolean') {
    return auth && user && !tokenHasExpired();
  }
  // Checks if the user has the correct role
  if (auth) {
    if (user && !tokenHasExpired()) {
      for (const role of auth) {
        if (user.roles.includes(role)) {
          return true;
        }
      }
    }
    return false;
  }
  return true; // no auth required
}

export function getElement(loggedIn: boolean, page: Page) {
  return loggedIn && page.authElement ? page.authElement : page.element;
}
