/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export type TRelationshipValues = Record<string, string> | undefined;

export interface IObjectRelationships {
  one: TRelationshipValues;
  many: TRelationshipValues;
  foreign_keys: TRelationshipValues;
}

export interface IAttributeData {
  [attributeKey: string]: any;
}

export interface IAttributes {
  [objectType: string]: IAttributeData;
}

export interface IRelationships {
  [objectType: string]: IObjectRelationships;
}

export interface IEntityMeta {
  flatAttributes: IAttributes;
  relationships: IRelationships;
}
