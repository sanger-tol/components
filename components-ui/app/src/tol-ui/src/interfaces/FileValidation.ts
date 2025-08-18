/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export type TSeverity = "error" | "warning";
export type TIconType = "check" | "xmark" | "exclamation";

export interface ICellId {
  column: string;
  row: string;
}

export interface IUploadStatus {
  className: string;
  text: string;
}

export interface IValidationConfig {
  s3_url: string;
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
  validationResults: IValidationResult[];
  failureMessage: string | null;
}