/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  generateFilter,
  isAttribute,
  isRelationship,
  RELATIONSHIP_SEPARATOR,
} from "../..";
import type { IZone, IFilter, IFieldTranslationParams, TRelationshipPaths } from "../..";

/**
 * Handles translation of one-to-many relationship filters.
 * Translates filter attributes from the zone above by adding the relationship path prefix.
 *
 * @param field - The field name to translate.
 * @param filterValue - The filter value for the field.
 * @param objectType - The current zone's object type.
 * @param zoneAboveObjectType - The zone above's object type.
 * @param paths - Relationship path lookup table.
 * @param dataspace - The dataspace for checking relationship availability.
 * @param translatedFilter - The filter object to update with translated attributes.
 */
async function handleOneToManyRelationship({
  field,
  filterValue,
  objectType,
  zoneAboveObjectType,
  paths,
  dataspace,
  translatedFilter
}: IFieldTranslationParams): Promise<void> {
  // Only translate if the attribute is used as a relationship
  if (await dataspace?.isAvailableOnRelationships(field, zoneAboveObjectType)) return;

  // Find the first relationship path to translate from
  const relationship = paths[objectType][zoneAboveObjectType].paths[0];
  translatedFilter.and_![relationship + RELATIONSHIP_SEPARATOR + field] = filterValue;
}

/**
 * Handles translation of many-to-one relationship filters.
 * Translates filter attributes by either removing the relationship prefix
 * (if the related object type matches the current zone) or replacing it with
 * the appropriate relationship path.
 *
 * @param field - The field name to translate (may include relationship prefix).
 * @param filterValue - The filter value for the field.
 * @param objectType - The current zone's object type.
 * @param zoneAboveObjectType - The zone above's object type.
 * @param paths - Relationship path lookup table.
 * @param translatedFilter - The filter object to update with translated attributes.
 */
async function handleManyToOneRelationship({
  field,
  filterValue,
  objectType,
  zoneAboveObjectType,
  paths,
  translatedFilter
}: IFieldTranslationParams): Promise<void> {
  const relatedObjectType = getRelationshipObjectType(field, zoneAboveObjectType, paths);

  if (relatedObjectType === objectType) {
    // If the relationship's object type matches the current zone's object type,
    // we can remove the relationship prefix.
    const newField = field.split(RELATIONSHIP_SEPARATOR).slice(-1)[0];
    translatedFilter.and_![newField] = filterValue;
  } else if (relatedObjectType) {
    /**
     * If the relationship's object type does not match the current zone's object type,
     * we can translate the filter by removing the relationship prefix and adding
     * the first relationship path to the attribute.
     */
    const newField = field.split(RELATIONSHIP_SEPARATOR).slice(-1)[0];
    const relationship = paths[objectType][relatedObjectType].paths[0];
    translatedFilter.and_![relationship + RELATIONSHIP_SEPARATOR + newField] = filterValue;
  }
}

/**
 * Translates filter attributes from the zone above into attributes usable by the current zone.
 *
 * @param currentZone - The current zone for which the filter is being translated.
 * @param zoneAbove - The zone above the current zone from which the filter is being translated.
 * @returns A promise that resolves to the translated filter for the current zone.
 */

export async function translateZoneAboveFilter(
  currentZone: IZone,
  zoneAbove?: IZone
): Promise<IFilter> {
  const translatedFilter: IFilter = { and_: {} };
  const { object_type, dataspace } = currentZone;

  if (zoneAbove) {
    /**
     * Paths are formatted from many-side to one-side.
     * For instance:
     * {
     *   "sequencing_request": {
     *     "tolid": { ... }
     *   }
     * }
     */
    const paths = await dataspace?.relationshipPaths();
    console.log('paths', paths)
    const zoneAboveFilter = generateFilter(zoneAbove);
    if (paths && translatedFilter.and_ && zoneAboveFilter) {
      for (const [field, filterValue] of Object.entries(zoneAboveFilter.and_ || {})) {
        if (
          /**
           * If the field is an attribute, the current zone's object type
           * is on the one-side of the relationship, and the zone above's
           * object type is on the many-side of the relationship - we can
           * translate the filter by adding the first relationship path to the attribute.
           */
          isAttribute(field) &&
          zoneAbove.object_type! in paths &&
          object_type! in paths[zoneAbove.object_type!]
        ) {
          await handleOneToManyRelationship({
            field,
            filterValue,
            objectType: object_type!,
            zoneAboveObjectType: zoneAbove.object_type!,
            paths,
            dataspace,
            translatedFilter
          });
        } else if (
          /**
           * If the field is a relationship, the current zone's object type
           * is on the many-side of the relationship, and the zone above's
           * object type is on the one-side of the relationship - we can
           * can do either of the following:
           * 1. If the relationship's object type matches the current zone's object type,
           *    we can remove the relationship prefix.
           * 2. If the relationship's object type does not match the current zone's object type,
           *    we can translate the filter by removing the relationship prefix and adding
           *    the first relationship path to the attribute.
           */
          isRelationship(field) &&
          object_type! in paths &&
          zoneAbove.object_type! in paths[object_type!]
        ) {
          await handleManyToOneRelationship({
            field,
            filterValue,
            objectType: object_type!,
            zoneAboveObjectType: zoneAbove.object_type!,
            paths,
            translatedFilter
          });
        }
      }
    }
  }
  return translatedFilter;
}

/**
 * Finds the related object type whose relationship path matches a field prefix.
 *
 * @param field - Field key to inspect (for example, `species.name`).
 * @param objectType - Current object type used as the lookup root in `paths`.
 * @param paths - Relationship path lookup table keyed by source and target object types.
 * @returns The matched related object type, or `null` when no relationship prefix matches.
 */
function getRelationshipObjectType(
  field: string,
  objectType: string,
  paths: TRelationshipPaths
): string | null {
  for (const [relatedObjectType, relationship] of Object.entries(paths[objectType] || {})) {
    if (relationship.paths.some(path => field.startsWith(path + RELATIONSHIP_SEPARATOR))) {
      return relatedObjectType;
    }
  }
  return null;
}
