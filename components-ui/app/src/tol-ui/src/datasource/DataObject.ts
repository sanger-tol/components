/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export class DataObject {
  private _objectType: string;
  private _id: string;
  private _attributes: Map<string, any>;
  private _relationships?: Map<string, DataObject>;

  constructor(
    objectType: string,
    id: string,
    attributes: Map<string, any>,
    relationships?: Map<string, DataObject>,
  ) {
    this._objectType = objectType;
    this._id = id;
    this._attributes = attributes;
    this._relationships = relationships;
  }

  public get objectType(): string { return this._objectType; }
  public set objectType(type: string) { this._objectType = type; }
  public get id(): string { return this._id; }
  public set id(id: string) { this._id = id; }
  public get relationships(): Map<string, DataObject> | undefined { return this._relationships }

  public getFieldByName(field: string): any {
    if (field.includes(".")) {
      const [relationship, ...rest] = field.split(".");
      const relationshipObject = this._relationships?.[relationship];
      if (relationshipObject) {
        return this.getFieldByName(rest.join("."));
      }
    }
    return this._attributes[field];
  }
}
