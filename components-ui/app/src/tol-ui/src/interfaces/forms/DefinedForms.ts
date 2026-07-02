/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IFieldMapping, IFormConfig } from "..";

export interface IUserProfileAdditionalConfigs {
  /**
   * Optional additional form configuration to merge with the base form configuration.
   */
  additionalConfig?: IFormConfig;
  /**
   * Optional array of positions to insert the additional configuration into the base form configuration.
   */
  additionalConfigArrayPositions?: number[];
  /**
   * Optional array of field mappings to apply to the form data.
   */
  additionalFieldMappings?: IFieldMapping[];
}
