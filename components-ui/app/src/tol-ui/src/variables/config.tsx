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

env.QUASAR_BASE = {
  url: env.QUASAR_URL ?? "https://quasar.tol.sanger.ac.uk",
  apiPath: env.QUASAR_API_PATH ?? "/api/v1",
  apiDataPath: env.QUASAR_API_DATA_PATH ?? "/data",
}

env.TOL_DATA = {
  ...env.QUASAR_BASE,
  dataspace: env.TOL_PRODUCTION_DATASPACE ?? "tol_production",
};

export { env };
