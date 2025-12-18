/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  VALIDATE_AND_MARK_AS_READY,
  VALIDATE_AND_UPLOAD,
  VALIDATE_ONLY
} from "src/constants";

export type TSeverity = "error" | "warning";
export type TIconType = "check" | "xmark" | "exclamation" | "question";

export interface ICellId {
  column: string;
  row: string;
}

export interface IUploadStatus {
  className: string;
  text: string;
}

export interface IValidationConfig {
  s3_bucket: string;
  pipeline_id: number;
  destination: string;
}

export interface IErrorWarningCount {
  errors: number;
  warnings: number;
}

export interface IValidationResultAPI {
  code: string;
  detail: string;
  field: string | null;
  object_id: string;
  severity: TSeverity;
  step_name: string;
}

export interface IValidationResult {
  code: string;
  detail: string;
  field: string | null;
  objectId: string;
  severity: TSeverity;
  stepName: string;
}

export interface IPipelineUploadAPI {
  id: string;
  completed: boolean;
  date_started: string;
  flow_run_id: string;
  s3_filename: string;
  s3_bucket: string;
  validation_results: IValidationResult[];
  failure_message: string | null;
}

export interface IPipelineUpload {
  id: string;
  completed: boolean;
  dateStarted: string;
  flowRunId: string;
  pipelineName: string;
  pipelineId: string;
  pipelineSteps: string[];
  s3Filename: string;
  s3Bucket: string;
  validationResults: IValidationResult[];
  failureMessage: string | null;
}

export type TFileValidationPurpose = typeof VALIDATE_ONLY | typeof VALIDATE_AND_UPLOAD | typeof VALIDATE_AND_MARK_AS_READY;
