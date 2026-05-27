/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import {
  TsDataSource,
  API_METHODS,
  API_PATHS,
  TDataObjectListOrNull,
  USER
} from "../..";

const authDataSource = new TsDataSource({
  apiPath: "/api/v1",
  apiDataPath: API_PATHS.AUTH,
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

export function getRoleIdsByNames(
  roleNames: string[],
  dataSource: TsDataSource,
) {

  return dataSource.getListPage({
    objectType: USER.ROLE,
    filter: {
      "and_": {
        "name": {
          "in_list": {
            "value": roleNames,
          },
        },
      }
    }
  }).then((res: TDataObjectListOrNull) => {
    return res?.map((role: any) => role.id) || [];
  })
}
