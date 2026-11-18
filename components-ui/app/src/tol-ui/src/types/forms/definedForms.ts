/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  IFormConfig,
  IUserProfileFormData,
} from "../..";

/** User profile form data when a profile is available, otherwise `null`. */
export type TUserProfileFormDataOrNull = IUserProfileFormData | null;

/** The base configuration for a user profile form, including fields and button configuration. */
export type TProfileBaseConfig =
  /** Static fields and button configuration for the base form. */
  | IFormConfig
  /** Factory that can adjust the base form configuration based on edit state. */
  | ((hasUnsavedChanges: boolean, ...args: any[]) => IFormConfig);
