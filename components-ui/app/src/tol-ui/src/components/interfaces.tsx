/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IFilterDrawer {
  open: boolean;
  setOpen: () => void;
}

export interface IConfigDrawer {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
}

export interface IAttributeSelector {
  endpoint: string;
  placeholder: string;
  baseUrl?: string;
  allowedTypes?: string[];
  attribute: string[];
  setAttribute: (attribute: string[]) => void;
  disabledValues?: any;
  numPopulatedFields?: number;
  tooltipContent?: string;
  setEntityMeta?: (entityMeta: any) => void;
}
