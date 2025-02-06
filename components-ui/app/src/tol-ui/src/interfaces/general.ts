/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// Keep in alphabetical order

export interface IAttributeSelector {
  additionalPopulatedFieldData?: any;
  allowedTypes?: string[]; // these need to be python types - 'int', 'str', etc...
  attribute: string[];
  baseUrl?: string;
  disabledValues?: any;
  displaySource?: boolean;
  endpoint: string;
  maxSelections?: number;
  numPopulatedFields?: number;
  placeholder: string;
  populatedFieldType?: string; // ie. "filter" or "column"
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
