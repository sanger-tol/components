/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BASE_POLICIES_MAP,
  BASE_MODES_MAP,
  FILE_VALIDATION_STATUS,
  VALIDATION_ENDPOINTS,
} from "../..";

import type {
  TFileValidationAction,
  TFileValidationStatus,
  TValidationActionId,
  TValidationActionMap,
  TValidationModule,
} from "../..";

/**
 * Creates a file validation action object that updates the validation status of an upload.
 *
 * This helper constructs a standard action definition (with ID, label, and callback)
 * configured to update the `validation_status` attribute of the current upload item
 * in the database when triggered.
 *
 * @param action - An object containing the identifier and display label for the action.
 * @param status - The target validation status to apply when the action is executed.
 * @returns A complete `TFileValidationAction` object containing the logic to update the status.
 */

export function setValidationStatusAction(
  action: { id: TValidationActionId; label: string },
  status: TFileValidationStatus,
): TFileValidationAction {
  return {
    id: action.id,
    label: action.label,
    callback: async ({ item, dataSource }) => {
      await dataSource.upsert({
        objectType: VALIDATION_ENDPOINTS.UPLOAD,
        payload: [
          {
            type: "upload",
            id: item.id,
            attributes: {
              validation_status: status,
            },
          },
        ],
      });
    },
  };
}

export function createBaseActions(): TValidationActionMap {
  return {
    viewReport: {
      id: "viewReport",
      label: "View Report",
      callback: ({ item, dataSource }) => dataSource.viewReport(item),
    },
    downloadReport: {
      id: "downloadReport",
      label: "Download Report",
      callback: ({ item, dataSource }) => dataSource.downloadReport(item),
    },
    revalidate: {
      id: "revalidate",
      label: "Revalidate",
      callback: ({ item, dataSource }) => dataSource.custom({}),
    },
    mark_as_ready: {
      ...setValidationStatusAction(
        { id: "mark_as_ready", label: "Mark as Ready" },
        "marked_as_ready",
      ),
      isAvailable: ({ item }) =>
        item.validationStatus ===
          FILE_VALIDATION_STATUS.COMPLETED_PASSED_NO_ISSUES ||
        item.validationStatus ===
          FILE_VALIDATION_STATUS.COMPLETED_PASSED_WARNINGS,
    },
    unmark_as_ready: {
      ...setValidationStatusAction(
        { id: "unmark_as_ready", label: "Unmark as Ready" },
        "validation_completed_passed_no_issues", // not easy to determine previous status
      ),
      isAvailable: ({ item }) =>
        item.validationStatus === FILE_VALIDATION_STATUS.MARKED_AS_READY,
    },
    reject: {
      // TODO: Add rejection reason to DB
      ...setValidationStatusAction(
        { id: "reject", label: "Reject File" },
        "file_rejected",
      ),
      isAvailable: ({ user }) => user?.roles.includes("admin") ?? false,
    },
  };
}

export function createBasePolicies() {
  return BASE_POLICIES_MAP;
}

// TODO: Implement modes
export function createBaseModes() {
  return BASE_MODES_MAP;
}

export function createBaseValidationModule(): TValidationModule {
  return {
    actions: createBaseActions(),
    policies: createBasePolicies(),
  };
}
