/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon } from "../..";
import { generateFormNavStatusLabel, generateFormNavStatusIcon } from "../..";
import type { TFieldNavStatus, TScrollNavGroupStatus } from "../..";

/** Props for the FormNavStatus component. */
export interface PFormNavStatus {
  /** The status of the form field or scroll navigation group. */
  status?: TFieldNavStatus | TScrollNavGroupStatus;
}

/** Renders the status indicator for a form field or scroll navigation group. */
export function FormNavStatus(props: PFormNavStatus) {
  const { status } = props;

  const label = generateFormNavStatusLabel(status || "none");
  const icon = generateFormNavStatusIcon(status || "none");

  const kind = typeof status === "string" ? status : status?.kind;

  if (!label && !icon) return null;

  return (
    <span
      className={`tol-form-sidenav-status tol-form-sidenav-status--${kind || "none"}`}
      title={label ?? ""}
    >
      {icon && (
        <span aria-hidden="true">
          <Icon icon={icon} />
        </span>
      )}
      <span
        className={
          status === "complete" ? "tol-form-sidenav-status__sr-only" : undefined
        }
      >
        {label}
      </span>
    </span>
  );
}
