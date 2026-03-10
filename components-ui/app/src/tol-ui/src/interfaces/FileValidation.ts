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

export interface IValidationSubmissionMutation {
  id: string;
  attributeValue: string;
}

export type TValidationSubmissionMutations = IValidationSubmissionMutation[];

export type TValidationIssues = Record<string, IValidationResult[]>;

export interface IValidatedDataReport {
  title: string;
  uploadDetails: IValidationUploadDetails;
  issues: TValidationIssues;
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
  rejectionReason: string;
  s3Filename: string;
  s3Bucket: string;
  validationResults: IValidationResult[];
  failureMessage: string | null;
  hidden: boolean;
  oidcId: string;
  uploadName: string;
}

export interface IStepData {
  name: string;
  description: string;
}

export interface IStepValidationDetails {
  completed: boolean;
  failureMessage?: string | null;
}

export interface IStepDetails {
  stepName: string;
  results: IValidationResult[];
  description?: string;
  validationDetails?: IStepValidationDetails;
}

export type TStepsData = IStepData[] | [];
