/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";

/**
 * Interface for the data object representing a field in the remote object detail
 */
export interface IRemoteObjectDetailField {
  /**
   * The system name of the field to display
   */
  attribute: string;
  /**
   * The display name for the field, if different from the attribute name
   */
  displayName?: string;
  /**
   * Optional function to transform the value before rendering
   */
  valueFilter?: (value: any) => ReactNode;
}