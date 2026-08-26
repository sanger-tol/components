/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/** Combined metadata payload used by filters and translators. */
export interface IEntityMeta {
  /** Flattened attribute metadata grouped by object type. */
  flatAttributes: TAttributes;
  /** Relationship metadata grouped by object type. */
  relationships: TRelationships;
}

/** Attribute metadata keyed by object type. */
export type TAttributes = Record<string, TObjectAttributes>;

/** Attribute metadata keyed by attribute name. */
export type TObjectAttributes = Record<string, IAttributeDescriptor>;

/** Metadata for a single attribute from `attribute_metadata`. */
export interface IAttributeDescriptor {
  /** Whether this attribute is marked as recommended. */
  authoritative: boolean;
  /** Optional semantic role used by downstream renderers. */
  acts_as?: string;
  /** Whether this attribute can be traversed through relationship paths. */
  available_on_relationships?: boolean;
  /** Optional distinct-value count or approximate selectivity metric. */
  cardinality?: number;
  /** Human-readable description of the attribute. */
  description?: string;
  /** Human-readable display label for UI usage. */
  display_name?: string;
  /** Owning object type for this attribute. */
  object_type?: string;
  /** Backend/native type identifier (e.g. `str`, `int`, `datetime`). */
  python_type?: string;
  /** Relationship name used when this attribute is surfaced via a relationship. */
  relationship_name?: string;
  /** Attribute source identifier e.g. `sts`. */
  source?: string;
}

/** Relationship mappings keyed by relationship name. */
export type TRelationshipValues = Record<string, string> | undefined;

/** Relationship groups for a single object type. */
export interface IObjectRelationships {
  /** To-one relationships keyed by relationship name, where values are target object types. */
  one: TRelationshipValues;
  /** To-many relationships keyed by relationship name, where values are target object types. */
  many: TRelationshipValues;
  /**
   * Foreign-key style links keyed by relationship name,
   * where values are the foreign key field names in the target object type.
   */
  foreign_keys: TRelationshipValues;
}

/** Relationship metadata keyed by object type. */
export type TRelationships = Record<string, IObjectRelationships>;

/** Cardinality filter constraint used when selecting attributes. */
export interface IAllowedCardinality {
  /** Comparison operator (`>`, `<`, `=`, `>=`, `<=`). */
  operator: string;
  /** Numeric threshold used by the operator. */
  value: number;
}

/** Minimal attribute details for display/overrides in UI components. */
export interface IAttributeDetails {
  /** Attribute source identifier (for example `sts`). */
  source?: string;
  /** Optional display label override for the attribute. */
  rename?: string;
}