/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * Represents a single choice in a relationship selector
 */
export interface IRelationshipSelectorChoice {
  /**
   * Human-readable label for the relationship, e.g. "Samples"
   */
  label: string;
  /**
   * The relationship e.g. "samples"
   */
  value: string;
  /**
   * The object type that the relationship points to, e.g. "sample"
   */
  targetObjectType: string;
}

/**
 * Array of relationship selector choices
 */
export type TRelationshipSelectorChoices = IRelationshipSelectorChoice[];
