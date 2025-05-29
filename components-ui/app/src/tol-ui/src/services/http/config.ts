/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { env } from "../../variables";


const serializeParam = (k, v) => {
  const sK = encodeURIComponent(k);
  let sV;
  if (typeof v == "string") {
    sV = encodeURIComponent(v);
  } else {
    sV = encodeURIComponent(JSON.stringify(v));
  }
  return `${sK}=${sV}`;
};

const serializeParams = (params) =>
  Object.entries(params)
    .filter(
      ([_, v]) => v !== undefined, // eslint-disable-line
    )
    .map(([k, v]) => serializeParam(k, v))
    .join("&");

export const CONFIG = {
  baseURL: env.API_PATH,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: serializeParams,
};
