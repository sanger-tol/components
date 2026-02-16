/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Dispatch, SetStateAction } from "react";
import type { IAllValidationData, TsDataSource } from "../..";

// Types related to file validation policies, actions, and their contexts.
export type TValidationActionId =
  | "viewReport"
  | "downloadReport"
  | "reject"
  | "revalidate"
  | "markAsReady"
  | "unmarkAsReady"
  | "downloadFile"
  | "hideItem"
  | "showItem";

// Constants related to what a user can do when they click 'validate'
export const VALIDATION_PURPOSE = [
  "Validate",
  "Validate and Upload",
  "Validate and Mark as Ready",
] as const;

// Constants for the base validation statuses (generic enough to be used across all apps
// that use the validation component)
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

// Can only be one of VALIDATION_PURPOSE
export type TFileValidationPurpose = (typeof VALIDATION_PURPOSE)[number];

// Can only be one of FILE_VALIDATION_STATUS
export type TFileValidationStatus =
  (typeof FILE_VALIDATION_STATUS)[keyof typeof FILE_VALIDATION_STATUS];

// All the required fields for each defined policy
export type TFileValidationStatusPolicy = {
  /**
   * One of the predefined file validation statuses
   */
  status: TFileValidationStatus;
  /**
   * The renamed status as shown on the UI
   */
  rename: string;
  /**
   * The summary describing the nature of the status and what a user can do about it
   */
  summary: string;
  /**
   * The color the text is on the UI
   */
  textColor: string;
  /**
   * Whether it's a status that requires additional UI elements rendered
   * i.e. <InfoTooltip /> with a failure reason attached
   */
  isFailureStatus: boolean;
  /**
   * The allowed actions mapped to this status, this stops users from trying to
   * perform an action they won't be able to complete,
   * i.e. "validation_timeout" status cannot use "markAsReady" action
   */
  allowedActions: TValidationActionId[];
};

export type TValidationContextItem =
  | IAllValidationData
  | Partial<IAllValidationData>;

export type TValidationContextItems = TValidationContextItem[];

export type TValidationActionContext = {
  items: TValidationContextItems;
  dataSource: TsDataSource;
  user?: { roles: string[] };
  setReportOpen?: (open: boolean) => void;
  setSubmissionRejectModalOpen?: (open: boolean) => void;
  setForceTableUpdate?: Dispatch<SetStateAction<boolean>>;
  setSelectedRows?: Dispatch<SetStateAction<string[]>>;
};

export type TValidationUserContext = {
  items: TValidationContextItems;
  user?: { roles: string[] };
};

export type TFileValidationAction = {
  id: TValidationActionId;
  label: string;
  isAvailable?: (ctx: TValidationUserContext) => boolean;
  callback: (ctx: TValidationActionContext) => Promise<void> | void;
};

// A map of validation statuses to their corresponding policies
export type TFileValidationStatusPolicyMap = Record<
  TFileValidationStatus,
  TFileValidationStatusPolicy
>;

// A map of action ids to their corresponding action objects
export type TValidationActionMap = Record<
  TValidationActionId,
  TFileValidationAction
>;

// A 'module' containing all the base policies and base actions related to file validation,
// this is what gets imported into the main Provider component and used to determine
// what to render and how the actions work based on the validation status of an upload
export type TValidationPolicyModule = {
  actions: Record<TValidationActionId, TFileValidationAction>;
  policies: Record<TFileValidationStatus, TFileValidationStatusPolicy>;
};
