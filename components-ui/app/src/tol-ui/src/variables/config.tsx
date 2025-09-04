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

env.TOL_DATA = env.PORTAL_URL + env.PORTAL_API_PATH + env.PORTAL_API_DATA_PATH + "/tol_production"
               || undefined;

export { env };
