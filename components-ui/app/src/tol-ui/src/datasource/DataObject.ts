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
    // If there is a dot in the field name, then all words except the final one are actually
    // names of relationships.
    if (field.includes(".")) {
      // Get the data object of the first relationship
      const [relationship, ...rest] = field.split(".");
      const relationshipObject = this._relationships?.[relationship];

      // Recursively search this object too. If there are multiple relationships, the number
      // of dots in the field name will shrink by one each time
      if (relationshipObject) {
        return relationshipObject.getFieldByName(rest.join("."));
      }
    }

    // If there was no dot, the field relates to this data object. So search this object's
    // attributes resulting in the value of the field or `undefined` depending on whether the field
    // actually exists in this object
    // (TERMINATING CLAUSE)
    if (!this._attributes) return undefined;
    else return this._attributes[field];
  }
}
