/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IAttributeDescriptor } from "..";


/**
 * Relationship mappings keyed by relationship name.
 */
export type TRelationshipValues = Record<string, string> | undefined;

/**
 * Relationship groups for a single object type.
 */
export interface IObjectRelationships {
  /**
   * To-one relationships keyed by relationship name, where values are target object types.
   */
  one: TRelationshipValues;
  /**
   * To-many relationships keyed by relationship name, where values are target object types.
   */
  many: TRelationshipValues;
  /**
   * Foreign-key style links keyed by relationship name, where values are the foreign key field names in the target object type.
   */
  foreign_keys: TRelationshipValues;
}

/**
 * Attribute metadata keyed by attribute name.
 */
export type TAttributeData = Record<string, IAttributeDescriptor>;

/**
 * Attribute metadata keyed by object type.
 */
export interface IAttributes {
  [objectType: string]: TAttributeData;
}

/**
 * Relationship metadata keyed by object type.
 */
export type TRelationships = Record<string, IObjectRelationships>;

/**
 * Combined metadata payload used by filters and translators.
 */
export interface IEntityMeta {
  /**
   * Flattened attribute metadata grouped by object type.
   */
  flatAttributes: IAttributes;
  /**
   * Relationship metadata grouped by object type.
   */
  relationships: TRelationships;
}
