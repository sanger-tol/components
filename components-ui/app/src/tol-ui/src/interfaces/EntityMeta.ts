/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IRelationship {
  one?: Record<string, string>;
  many?: Record<string, string>;
  foreign_keys?: Record<string, string>;
}

export interface IAttributeData {
  [attributeKey: string]: any;
}

export interface IAttributes {
  [objectType: string]: IAttributeData;
}

export interface IRelationships {
  [objectType: string]: IRelationship;
}

export interface IEntityMeta {
  flatAttributes: IAttributes;
  relationships: IRelationships;
}
