/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TStepsData } from "../file-validation";

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
  isReady: boolean;
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
  s3Filename: string;
  s3Bucket: string;
  validationResults: IValidationResult[];
  failureMessage: string | null;
  isReady: boolean;
}

/* 
  <----- VALIDATION STATUS SYSTEM ----->
*/

export type TValidationActionId =
  | "viewReport"
  | "downloadReport"
  | "reject"
  | "revalidate"
  | "mark_as_ready"
  | "unmark_as_ready";

export const VALIDATION_PURPOSE = [
  "Validate",
  "Validate and Upload",
  "Validate and Mark as Ready",
] as const;

export const FILE_VALIDATION_STATUS = {
  // initial status for all validations
  IN_PROGRESS: "validation_in_progress",

  // base statuses determined by the flow
  SYSTEM_ERROR: "validation_system_error",
  COMPLETED_FAILED_ERRORS: "validation_completed_failed_with_errors",
  COMPLETED_PASSED_WARNINGS: "validation_completed_passed_with_warnings",
  COMPLETED_PASSED_NO_ISSUES: "validation_completed_passed_no_issues",

  // automatically checked when user uses validation page
  TIMEOUT: "validation_timeout",

  // user initiated statuses
  FILE_REJECTED: "file_rejected",
  MARKED_AS_READY: "marked_as_ready",
} as const;

export type TFileValidationPurpose = (typeof VALIDATION_PURPOSE)[number];
export type TFileValidationStatus =
  (typeof FILE_VALIDATION_STATUS)[keyof typeof FILE_VALIDATION_STATUS];

export type TFileValidationStatusPolicy = {
  status: TFileValidationStatus;
  rename: string;
  summary: string;
  textColor: string;
  allowedActions: TValidationActionId[];
};

export type TValidationActionContext = {
  item: IAllValidationData;
  api: {
    reject: (id: string, reason?: string) => Promise<void>;
    markAsReady: (id: string) => Promise<void>;
    unmarkAsReady: (id: string) => Promise<void>;
    revalidate: () => Promise<void>;
    viewReport: (data: IAllValidationData) => Promise<void>;
    downloadReport: (data: IAllValidationData) => Promise<void>;
  };
  user?: { roles: string[] };
};

export type TFileValidationAction = {
  id: TValidationActionId;
  label: string;
  isAvailable?: (ctx: TValidationActionContext) => boolean;
  callback: (ctx: TValidationActionContext) => Promise<void>;
};

export type TFileValidationStatusPolicyMap = Record<
  TFileValidationStatus,
  TFileValidationStatusPolicy
>;
