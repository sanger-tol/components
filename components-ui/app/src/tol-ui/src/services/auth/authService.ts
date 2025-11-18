/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import {
  TsDataSource,
  Page,
  tokenHasExpired,
  API_METHODS,
  AUTH_API_DATA_PATH,
} from "../..";

const authDataSource = new TsDataSource({
  apiPath: "/api/v1",
  apiDataPath: AUTH_API_DATA_PATH
});

export function getUrlLogin() {
  return authDataSource
    .custom({
      method: API_METHODS.GET,
      resource: "login",
    })
    .then((res: any) => {
      return {
        loginUrl: res!.data!.loginUrl,
        userData: {
          name: res!.data!.name,
        },
      };
    });
}

export function getToken(data: any) {
  return authDataSource
    .custom({
      method: API_METHODS.POST,
      resource: "token",
      body: data,
    });
}

export function getProfile(token: string) {
  return authDataSource
    .custom({
      method: API_METHODS.POST,
      resource: "profile",
      body: { token },
    });
}

export function getRoles() {
  return authDataSource
    .custom({
      method: API_METHODS.GET,
      resource: "roles",
    });
}

export function confirmAuthorised(
  user: any,
  auth?: boolean | string[],
  noAuth?: boolean,
) {
  // If a user is logged in and the page is set to hide when logged in
  if (noAuth && user) {
    return false;
  }
  // Check if the user is logged in and the token has not expired if the page requires auth
  if (typeof auth === "boolean") {
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

export function getElementDependingOnAuthStatus(loggedIn: boolean, page: Page) {
  return loggedIn && page.authElement ? page.authElement : page.element;
}
