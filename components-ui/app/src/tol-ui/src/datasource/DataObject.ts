/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ATTRIBUTE_NAME_AND_PROVENANCE_IN_FIELD_REGEX } from "..";

export class DataObject {
  private _id: string;
  private _objectType: string;
  private _attributes?: Record<string, any>;
  private _provenance?: object; // TODO Type needs refining when DataObject is implemented
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

    // If there was no dot, the field relates to this data object.
    const provenanceMatch = field.match(ATTRIBUTE_NAME_AND_PROVENANCE_IN_FIELD_REGEX);
    if (provenanceMatch) {
      // If this is a provenance field variation, fetch it from the provenance data of this object
      const [, fieldName, source] = provenanceMatch;
      return this._provenance?.[fieldName]?.[source];
    } else {
      // Else get it from this object's attributes
      return this._attributes?.[field];
    }
  }
}
