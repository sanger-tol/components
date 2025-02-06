/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// Keep in alphabetical order

export interface IAttributeSelector {
  endpoint: string;
  placeholder: string;
  populatedFieldType?: string; // ie. "filter" or "column"
  baseUrl?: string;
  allowedTypes?: string[]; // these need to be python types - 'int', 'str', etc...
  attribute: string[];
  setAttribute: (attribute: string[]) => void;
  disabledValues?: any;
  numPopulatedFields?: number;
  tooltipContent?: string;
  setEntityMeta?: (entityMeta: any) => void;
  additionalPopulatedFieldData?: any;
  recommendedFilterAvailable?: boolean;
  displaySource?: boolean;
  sticky?: boolean;
  renderSearchBySource?: boolean;
  maxSelections?: number;
}

export interface ISourceTag {
  source: string;
  className?: string;
}
