/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export const VALIDATE_ONLY = "Validate"; // TODO: Re-add "Only" if we re-introduce mode toggle
export const VALIDATE_AND_UPLOAD = "Validate and Upload";
export const VALIDATE_AND_MARK_AS_READY = "Validate and Mark as Ready";
export const FILE_VALIDATION_PATH = "/file-validation/results/";
export const REFRESH_INTERVAL = 1000;
export const MAX_ERRORS_TO_DISPLAY = 2;
export const BUTTON_TIMEOUT = 3000;
export const WIDTH_REDUCER = 40;
export const TOL_LOADER_STYLES = {
  minHeight: "250px",
  flexDirection: "column" as "column",
  alignItems: "center" as "center",
  display: "flex" as "flex",
};
export const DEFAULT_FILE_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
export const USER_SHOWN_FILE_TYPE_DEFAULTS = ".xlsx/.csv";
export const MAX_FILE_SIZE = "10mb";
export const DEFAULT_SHEET_NAME = "Metadata Entry";
export const VALIDATION_TIMEOUT_MS = 8 * 60 * 1000; // 8 minutes
