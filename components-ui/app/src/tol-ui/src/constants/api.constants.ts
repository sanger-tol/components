/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { env } from "../variables";

export const API_METHODS = {
  GET: "GET",
  POST: "POST",
  DELETE: "DELETE",
  PATCH: "PATCH",
  PUT: "PUT",
} as const;

export const API_OPERATIONS = {
  UPSERT: ":upsert",
  CURSOR: ":cursor",
  COUNT: ":count",
  ACTION: ":action",
  AGGREGATIONS: ":aggregations",
  AGGREGATIONS_LEGACY: ":aggregations_legacy",
  GROUP_STATS: ":group-stats",
  STATS: ":stats",
  TO_ONE: ":to-one",
  TO_MANY: ":to-many",
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const AUTH_API_DATA_PATH = "/auth";
export const LOCAL_API_DATA_PATH = "/local";
export const ACTION_API_DATA_PATH = LOCAL_API_DATA_PATH;
export const PREFECT_API_DATA_PATH = "/prefect";
export const DATA_UPLOAD_API_DATA_PATH = "/data-upload";
export const PIPELINE_API_DATA_PATH = "/run-pipeline";
export const API_PATH = env.API_PATH;

export const WEB_APP = "web_app";

export const ACTIONS = {
  ACTION: "action",
  RUN_ACTION: "run-action",
  ROLE_ACTION: "role_action",
} as const;

export const VALIDATIONS = {
  UPLOAD: "upload",
} as const;

export const VALIDATION_ENDPOINTS = {
  UPLOAD: "local/upload",
  RUN_PIPELINE: "run-pipeline",
  REVALIDATE: "run-pipeline/revalidate",
  PIPELINE_STEPS: "local/pipeline_steps",
} as const;

export const S3_ENDPOINTS = {
  UPLOAD: "data-upload/upload",
  DOWNLOAD: "data-upload/download",
} as const;

export const USER = {
  ROLE: "role",
} as const;
