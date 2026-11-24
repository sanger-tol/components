/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CARD_KEY_TYPE } from "../constants/field.constants";

/** Key display style used by an object-detail card or an individual field. */
export type TCardKeyType = typeof CARD_KEY_TYPE[number];

/** Interface for the data object representing a field in the remote object detail */
export interface IRemoteObjectDetailField {
  /** The system name of the field to display */
  attribute: string;
  /** The display name for the field, if different from the attribute name */
  displayName?: string;
  /** Renderer to use for displaying the field value (defaults to longText) */
  renderer?: string
}