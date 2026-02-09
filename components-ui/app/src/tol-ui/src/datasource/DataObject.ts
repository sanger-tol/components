/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export class DataObject {
  private objectType: string;
  private id: string;
  private attributes: Map<string, any>;
  private relationships: Map<string, DataObject>;

  constructor(
    objectType: string,
    id: string,
    attributes: Map<string, any>,
    relationships: Map<string, DataObject> | undefined,
  ) {
    this.objectType = objectType;
    this.id = id;
    this.attributes = attributes;
    this.relationships = new Map();
    this.relationships = relationships || new Map();
  }
}
