// SPDX-FileCopyrightText: 2022 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { env } from '../../variables/config'

export const CONFIG = {
  baseURL: env.API_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const END_POINT = {
  authUrlLogin: '/auth/login',
  authToken: '/auth/token',
  authProfile: '/auth/profile'
};
