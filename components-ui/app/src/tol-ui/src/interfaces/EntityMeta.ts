/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

interface IValues {
  [id: string]: string;
}

interface IRelationship {
  one?: IValues;
  many?: IValues;
  foreign_keys?: IValues;
}

export interface IAttributes {
  [objectType: string]: object;
}

export interface IRelationships {
  [objectType: string]: IRelationship;
}

export interface IEntityMeta {
  flatAttributes: IAttributes;
  relationships: IRelationships;
}
