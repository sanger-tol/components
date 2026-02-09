/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export class DataObject {
  private _id: string;
  private _objectType: string;
  private _attributes?: Record<string, any>;
  private _relationships?: Record<string, DataObject>;

  constructor(
    id: string,
    objectType: string,
    attributes?: Record<string, any>,
    relationships?: Record<string, DataObject>,
  ) {
    this._objectType = objectType;
    this._id = id;
    this._attributes = attributes;
    this._relationships = relationships;
  }

  public get id(): string { return this._id; }
  public set id(id: string) { this._id = id; }
  public get objectType(): string { return this._objectType; }
  public set objectType(type: string) { this._objectType = type; }
  public get attributes(): Record<string, any> | undefined { return this._attributes; }
  public get relationships(): Record<string, DataObject> | undefined { return this._relationships; }

  public getFieldByName(field: string): any | undefined {
    if (!this._attributes) return undefined;

    if (field.includes(".")) {
      const [relationship, ...rest] = field.split(".");
      const relationshipObject = this._relationships?.[relationship];
      if (relationshipObject) {
        return relationshipObject.getFieldByName(rest.join("."));
      }
    }
    return this._attributes[field];
  }
}
