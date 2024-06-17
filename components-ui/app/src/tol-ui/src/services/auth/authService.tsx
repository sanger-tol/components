/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { httpClient } from '../http/httpClient';


export function getUrlLogin() {
  return httpClient().get('/auth/login');
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
