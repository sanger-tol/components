/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// const processEnv = typeof process !== 'undefined' ? process.env : {};
const injectedEnv = window && "injectedEnv" in window ? window.injectedEnv : {};
const env: any = {
  // ...processEnv,
  ...(typeof injectedEnv === "object" ? injectedEnv : {}),
};

env.TOL_DATA = {
  url: env.PORTAL_URL,
  apiPath: env.PORTAL_API_PATH,
  apiDataPath: env.PORTAL_API_DATA_PATH,
  dataspace: env.PORTAL_DATASPACE ?? "tol_production",
};

export { env };
