/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  RELATIONSHIP_SEPARATOR,
  TDataObjectOrNull,
  TDataObjectListOrNull,
} from "..";

/**
 * Resolves a nested field value from a data object by traversing relationships.
 *
 * @param object - Starting object to read from.
 * @param field - Dot-delimited field path (for example, `"sample.species.name"`).
 * @returns The resolved value, a mapped array of values for to-many relationships, or `undefined` if no value is found.
 */
export function getFieldByName(object: TDataObjectOrNull, field: string): any {
  if (isRelationship(field)) {
    const [relationship, ...rest] = field.split(RELATIONSHIP_SEPARATOR);
    const relationshipObject = object?.relationships?.[relationship];
    if (relationshipObject) {
      if (Array.isArray(relationshipObject)) {
        return relationshipObject.map((item) =>
          getFieldByName(item, rest.join(RELATIONSHIP_SEPARATOR))
        );
      }
      return getFieldByName(relationshipObject, rest.join(RELATIONSHIP_SEPARATOR));
    }
  }
  return object?.[field];
}

/**
 * Filters a list of data objects so only the first occurrence of each `id` is kept.
 *
 * @param items - List of data objects (or null list) to filter.
 * @returns A list containing unique objects by `id`.
 */
function filterUniqueById(items: TDataObjectListOrNull): TDataObjectListOrNull {
  if (!items) return [null] as TDataObjectListOrNull;

  const seenIds = new Set<string>();

  return items.filter((item) => {
    if (!item?.id) return false;
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  }) as TDataObjectListOrNull;
}

/**
 * Resolves and returns the child data object(s) reached by following a dot-delimited relationship path.
 *
 * - If `field` contains dots (e.g., `"author.address.city"`), each segment is treated as a relationship name
 *   to traverse via `object.relationships[segment]`.
 * - Relationship values may be either a single object or an array of objects; arrays are recursively mapped and
 *   flattened into a single list.
 * - If `field` does not contain a dot, the current `object` is returned as a single-item list (even if `object` is `null`).
 *
 * @param object - The starting data object from which to traverse relationships.
 * @param field - Dot-delimited relationship path to traverse. If no dot is present, no traversal occurs.
 * @returns A list of resolved child objects, or `null` if any relationship segment is missing/undefined along the path.
 */
export function getChildObjectsByName(object: TDataObjectOrNull, field: string): TDataObjectListOrNull {
  if (isRelationship(field)) {
    const [relationship, ...rest] = field.split(RELATIONSHIP_SEPARATOR);
    const relationshipObject = object?.relationships?.[relationship];
    if (relationshipObject) {
      // If the relationship is an array, we need to recursively resolve the rest of the path for each item and flatten the results
      if (Array.isArray(relationshipObject)) {
        const objects = relationshipObject.flatMap(
          (item) => getChildObjectsByName(item, rest.join(RELATIONSHIP_SEPARATOR)) ?? []
        );
        return filterUniqueById(objects as TDataObjectListOrNull);
      }
      // If it's a single object, just resolve the rest of the path for that object
      return getChildObjectsByName(relationshipObject, rest.join(RELATIONSHIP_SEPARATOR));
    }
    // If any relationship segment is missing/undefined, return null
    return [null] as TDataObjectListOrNull;
  }
  // if the field does not include a dot, we assume it's a field on the current object
  return [object] as TDataObjectListOrNull;
}

/**
 * Extracts the attribute name from a field path by returning the last segment.
 * @param field - A dot-separated field path (e.g., "user.profile.name")
 * @returns The last segment of the field path (e.g., "name")
 * @example
 * getAttributeNameByField("user.profile.name") // returns "name"
 * getAttributeNameByField("id") // returns "id"
 */
export function getAttributeNameByField(field: string): string {
  return field.split(RELATIONSHIP_SEPARATOR).slice(-1)[0];
}

/**
 * Extracts the relationship name from a field path by removing the last segment.
 * @param field - A field path that may contain dot-separated segments (e.g., "relationship.field")
 * @returns The relationship name (all segments except the last one joined by dots), or an empty string if the field contains no dots
 * @example
 * getRelationshipNameByField("user.profile.name") // returns "user.profile"
 * getRelationshipNameByField("name") // returns ""
 */
export function getRelationshipNameByField(field: string): string {
  if (isRelationship(field)) {
    return field.split(RELATIONSHIP_SEPARATOR).slice(0, -1).join(RELATIONSHIP_SEPARATOR);
  }
  return "";
}

/**
 * Returns whether a field key represents a relationship path.
 *
 * A relationship is identified by the configured relationship separator
 * (for example, `.` in `sample.species.id`).
 */
export function isRelationship(key: string): boolean {
  return key.includes(RELATIONSHIP_SEPARATOR);
}

/**
 * Returns whether a field key represents a direct attribute.
 *
 * Attributes are keys that do not include a relationship separator.
 */
export function isAttribute(key: string): boolean {
  return !isRelationship(key);
}
