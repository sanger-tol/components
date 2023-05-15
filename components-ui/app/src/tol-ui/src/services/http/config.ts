// SPDX-FileCopyrightText: 2022 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { apiVersion } from '../../general/Env'

export const CONFIG = {
  baseURL: '/api/v' + apiVersion,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const END_POINT = {
  authUrlLogin: '/auth/login',
  authToken: '/auth/token',
  authProfile: '/auth/profile'
};
