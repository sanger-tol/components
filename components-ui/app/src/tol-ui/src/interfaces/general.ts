/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// Keep in alphabetical order

export interface IAttributeSelector {
  additionalPopulatedFieldData?: any;
  allowedTypes?: string[];
  attribute: string[];
  baseUrl?: string;
  disabledValues?: any;
  displaySource?: boolean;
  endpoint: string;
  maxSelections?: number;
  numPopulatedFields?: number;
  placeholder: string;
  populatedFieldType?: string;
  recommendedFilterAvailable?: boolean;
  renderSearchBySource?: boolean;
  setAttribute: (attribute: string[]) => void;
  sticky?: boolean;
  tooltipContent?: string;
}

export interface ISourceTag {
  className?: string;
  source: string;
}
