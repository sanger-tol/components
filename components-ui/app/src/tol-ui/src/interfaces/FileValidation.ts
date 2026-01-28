/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

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
  sheetName?: string;
  maxFileSize?: string;
  allowedFileTypes?: string;
  project?: string; // TODO: Decide if this needs to be an array
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
  code?: string;
  detail: string;
  field: string | null;
  objectId: string;
  severity: TSeverity;
  stepName?: string;
}

export interface IValidationUploadDetails {
  id: string;
  s3Filename: string;
  pipelineSteps: string;
  completed: boolean;
  dateStarted: string;
  flowRunId: string;
  pipelineName: string;
  pipelineId: string;
  s3Bucket: string;
  failureMessage: string | null;
}

export type TValidationIssues = Record<string, IValidationResult[]>;

export interface IValidatedDataReport {
  title: string;
  uploadDetails: IValidationUploadDetails;
  issues: TValidationIssues;
}

export interface IAllValidationDataAPI {
  id: string;
  completed: boolean;
  date_started: string;
  flow_run_id: string;
  s3_filename: string;
  s3_bucket: string;
  validation_results: IValidationResultAPI[];
  failure_message: string | null;
}

export interface IAllValidationData {
  id: string;
  completed: boolean;
  dateStarted: string;
  flowRunId: string;
  pipelineName: string;
  pipelineId: string;
  pipelineSteps: TStepsData;
  validationStatus: string;
  s3Filename: string;
  s3Bucket: string;
  validationResults: IValidationResult[];
  failureMessage: string | null;
}

export interface IStepData {
  name: string;
  description: string;
}

export type TStepsData = IStepData[] | [];
