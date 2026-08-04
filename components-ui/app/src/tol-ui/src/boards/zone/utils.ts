/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  generateFilter,
  generateTranslatedFilter,
  isAttribute,
  isRelationship,
  mergeFilters,
  RELATIONSHIP_SEPARATOR,
} from "../..";
import type { IZone, IFilter, IFieldTranslationParams } from "../..";


/**
 * Translates an attribute filter from the zone above into a relationship-prefixed
 * filter usable by the current zone when traversing from one-side to many-side.
 *
 * @param params - Relationship translation inputs for the current and parent zones.
 * @returns A promise that resolves when the translated filter has been updated.
 */
async function addRelationshipPrefix({
  incomingField,
  filterValue,
  objectType,
  zoneAboveObjectType,
  paths,
  dataspace,
  translatedFilter
}: IFieldTranslationParams): Promise<void> {
  // Only translate if the attribute is used as a relationship
  if (await dataspace?.isAvailableOnRelationships(incomingField, zoneAboveObjectType)) {
    // Find the first relationship path to translate from
    const relationship = paths[objectType][zoneAboveObjectType].paths.values().next().value;
    if (!relationship) return;
    translatedFilter.and_![relationship + RELATIONSHIP_SEPARATOR + incomingField] = filterValue;
  }
}

/**
 * Translates a relationship-prefixed filter from the zone above into the field
 * format expected by the current zone when traversing from many-side to one-side.
 *
 * @param params - Relationship translation inputs for the current and parent zones.
 * @returns A promise that resolves when the translated filter has been updated.
 */
async function removeOrChangeRelationshipPrefix({
  incomingField,
  filterValue,
  objectType,
  zoneAboveObjectType,
  paths,
  dataspace,
  translatedFilter
}: IFieldTranslationParams): Promise<void> {
  // Find the related object type whose relationship path matches the field prefix
  const relatedObjectType = await dataspace?.getObjectTypeByField(incomingField, zoneAboveObjectType);

  // Only translate attributes that are available on relationships
  if (relatedObjectType && await dataspace?.isAvailableOnRelationships(incomingField, relatedObjectType)) {
    if (relatedObjectType === objectType) {
      /*
       * If the relationship's object type matches the current zone's object type,
       * we can remove the relationship prefix.
       */
      const newField = incomingField.split(RELATIONSHIP_SEPARATOR).slice(-1)[0];
      translatedFilter.and_![newField] = filterValue;
    } else if (relatedObjectType) {
      /**
       * If the relationship's object type does not match the current zone's object type,
       * we can translate the filter by removing the relationship prefix and adding
       * the first relationship path to the attribute.
       */
      const newField = incomingField.split(RELATIONSHIP_SEPARATOR).slice(-1)[0];
      const relationship = paths[objectType][relatedObjectType].paths.values().next().value;
      if (!relationship) return;
      translatedFilter.and_![relationship + RELATIONSHIP_SEPARATOR + newField] = filterValue;
    }
  }
}

/**
 * Translates filter attributes from the zone above into attributes usable by the current zone.
 *
 * @param currentZone - The current zone for which the filter is being translated.
 * @param zoneAbove - The zone above the current zone from which the filter is being translated.
 * @param translations - Optional custom translations for incoming filters.
 * @returns A promise that resolves to the translated filter for the current zone.
 */
export async function translateZoneAboveFilter(
  currentZone: IZone,
  zoneAbove?: IZone,
): Promise<IFilter> {
  const { object_type, dataspace } = currentZone;
  let translatedFilter: IFilter = { and_: {} };

  if (zoneAbove) {
    /**
     * Paths are formatted from many-side to one-side.
     * For instance:
     * {
     *   "specimen": {
     *     "species": { ... }
     *   }
     * }
     */
    const paths = await dataspace?.relationshipPaths();
    const zoneAboveFilter = generateFilter(zoneAbove);
    if (paths && translatedFilter.and_ && zoneAboveFilter) {
      /**
       * Add the custom translations to the translated filter if they exist.
       */
      translatedFilter = mergeFilters(
        translatedFilter,
        generateTranslatedFilter(zoneAbove, currentZone.translations || {}),
      );

      for (const [incomingField, filterValue] of Object.entries(zoneAboveFilter.and_ || {})) {
        // If the field already exists in the translated filter, skip automatic translation
        if (incomingField in zoneAboveFilter.and_!) continue;
        if (
          /**
           * If the field is an attribute, the current zone's object type is on the
           * one-side of the relationship, and the zone above's object type is on the
           * many-side of the relationship - we can translate the filter by adding the
           * first relationship path to the attribute.
           */
          isAttribute(incomingField) &&
          object_type! in paths &&
          zoneAbove.object_type! in paths[object_type!]
        ) {
          await addRelationshipPrefix({
            incomingField,
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
           * is on the many-side of the relationship, or the zone above's
           * object type is on the one-side of the relationship - we can
           * can do either of the following:
           * 1. If the relationship's object type matches the current zone's object type,
           *    we can remove the relationship prefix.
           * 2. If the relationship's object type does not match the current zone's object type,
           *    we can translate the filter by removing the relationship prefix and adding
           *    the first relationship path to the attribute.
           */
          isRelationship(incomingField) &&
          (zoneAbove.object_type! in paths ||
            object_type! in paths[zoneAbove.object_type!])
        ) {
          await removeOrChangeRelationshipPrefix({
            incomingField,
            filterValue,
            objectType: object_type!,
            zoneAboveObjectType: zoneAbove.object_type!,
            paths,
            dataspace,
            translatedFilter
          });
        }
      }
    }
  }
  return translatedFilter;
}
