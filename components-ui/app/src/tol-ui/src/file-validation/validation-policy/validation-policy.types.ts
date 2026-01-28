/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IAllValidationData, TsDataSource } from "../..";

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
  IN_PROGRESS: "validation_in_progress",
  SYSTEM_ERROR: "validation_system_error",
  COMPLETED_FAILED_ERRORS: "validation_completed_failed_with_errors",
  COMPLETED_PASSED_WARNINGS: "validation_completed_passed_with_warnings",
  COMPLETED_PASSED_NO_ISSUES: "validation_completed_passed_no_issues",
  TIMEOUT: "validation_timeout",
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
  dataSource: TsDataSource;
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

export type TValidationActionMap = Record<
  TValidationActionId,
  TFileValidationAction
>;

export type TValidationModule = {
  actions: Record<TValidationActionId, TFileValidationAction>;
  policies: Record<TFileValidationStatus, TFileValidationStatusPolicy>;
};