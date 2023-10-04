// SPDX-FileCopyrightText: 2022 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { env } from '../../variables/config'

const serializeParam = (k, v) => {
  const sK = encodeURIComponent(k);
  if (typeof(v) == "string"){
    var sV = encodeURIComponent(v)
  }else{
    var sV = encodeURIComponent(
      JSON.stringify(v)
    );
  }
  return `${sK}=${sV}`
}

const serializeParams = params => Object.entries(params).filter(
  ([_, v]) => v !== undefined
).map(
  ([k, v]) => serializeParam(k, v)
).join('&');

export const CONFIG = {
  baseURL: env.API_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: serializeParams,
};

export const END_POINT = {
  authUrlLogin: '/auth/login',
  authToken: '/auth/token',
  authProfile: '/auth/profile'
};
