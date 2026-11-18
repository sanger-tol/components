/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IFieldMapping, IFormConfig } from "..";

/** Optional configuration extensions for a user profile form. */
export interface IUserProfileAdditionalConfigs {
  /** Optional additional form configuration to merge with the base form configuration. */
  additionalConfig?: IFormConfig;
  /** Optional array of positions to insert the additional configuration into the base form configuration. */
  additionalConfigArrayPositions?: number[];
  /** Optional array of field mappings to apply to the form data. */
  additionalFieldMappings?: IFieldMapping[];
}

/** Common user profile values used to initialize or submit a profile form. */
export interface IUserProfileFormData {
  /** User's display name. */
  name?: string;
  /** User's email address. */
  email?: string;
  /** User's workplace or organization. */
  workplace?: string;
  /** Additional profile values supported by a particular application. */
  [key: string]: any;
}
