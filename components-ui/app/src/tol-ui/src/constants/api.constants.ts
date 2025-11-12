/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const API_METHODS = {
  GET: "GET",
  POST: "POST",
  DELETE: "DELETE",
  PATCH: "PATCH",
  PUT: "PUT",
}


export const AUTH_API_DATA_PATH = "/auth";
export const BOARDS_API_DATA_PATH = "/boards";
export const LOCAL_API_DATA_PATH = "/local";
export const ACTION_API_DATA_PATH = LOCAL_API_DATA_PATH;

export const BOARDS = {
  BOARD: "board",
  VIEW: "view",
  ZONE: "zone",
  COMPONENT: "component",
  VIEW_BOARD: "view_board",
  ZONE_VIEW: "zone_view",
  COMPONENT_ZONE: "component_zone",
  DATA_SOURCE_INSTANCE: "data_source_instance",
}

export const ACTIONS = {
  ACTION: "action",
  RUN_ACTION: "run-action",
}



export const VALIDATION_ENDPOINTS = {
  UPLOAD: "local/upload",
  RUN_PIPELINE: "run-pipeline",
  PIPELINE_STEPS: "local/pipeline_steps",
}

export const S3_ENDPOINTS = {
  UPLOAD: "data-upload/upload",
  DOWNLOAD: "data-upload/download",
}
