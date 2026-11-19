/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { StatusMessage } from "../messaging/StatusMessage";
import { Icon } from "./Icon";

/** Props for the BooleanStatus component. */
export interface PBooleanStatus {
  /** Boolean value to display as a status message. */
  value?: boolean | null;
  /** Show a compact check or cross icon instead of a status message. */
  mini?: boolean;
}

/** Displays a boolean value using the standard true/false status styling. */
export function BooleanStatus(props: PBooleanStatus) {
  const { value, mini } = props;

  if (value === null || value === undefined) return null;

  if (mini) {
    return (
      <Icon
        icon={value ? "check" : "xmark"}
        colour={value ? "var(--tol-success)" : "var(--tol-danger)"}
      />
    );
  }

  return value
    ? <StatusMessage message="True" status="success" />
    : <StatusMessage message="False" status="error" />;
}
