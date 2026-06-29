/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  generateFilter,
  isRelationship,
  RELATIONSHIP_SEPARATOR
} from "../..";
import type { IZone, IFilter, IFieldTranslationParams } from "../..";


/**
 * Adds a relationship prefix to an attribute when current zone is above the zone being filtered.
 * 
 * @param params - An object containing the parameters needed for the translation.
 * @returns A promise that resolves when the translation is complete.
 */
async function handleAddRelationshipPrefix({
  field,
  filter,
  objectType,
  zoneAboveObjectType,
  paths,
  dataspace,
  translatedFilter
}: IFieldTranslationParams): Promise<void> {
  
  const isAvailableOnRelationships = await dataspace?.isAvailableOnRelationships(
    field,
    zoneAboveObjectType
  );
  if (!isAvailableOnRelationships) return;

  if (isRelationship(field)) {
    translatedFilter.and_![field] = filter;
  } else {
    /**
     * Just use the first relationship path for the translation.
     * It might seem like the filter hasn't visually passed onto the second zone,
     * but this is because the relationship name might be different.
    */
    const relationship = paths[objectType][zoneAboveObjectType].paths[0];
    translatedFilter.and_![relationship + RELATIONSHIP_SEPARATOR + field] = filter;
  }
}

/**
 * Removes a relationship prefix from an attribute when current zone is below the zone being filtered.
 * 
 * @param params - An object containing the parameters needed for the translation.
 * @returns A promise that resolves when the translation is complete.
 */
async function handleRemoveRelationshipPrefix({
  field,
  filter,
  objectType,
  zoneAboveObjectType,
  paths,
  dataspace,
  translatedFilter
}: IFieldTranslationParams): Promise<void> {
  
  const isAvailableOnRelationships = await dataspace?.isAvailableOnRelationships(
    field,
    objectType
  );
  if (!isAvailableOnRelationships) return;

  let matchingPath = false;
  // Check if the attribute starts with any of the relationship paths
  for (const path of paths[zoneAboveObjectType][objectType].paths) {
    if (field.startsWith(path + RELATIONSHIP_SEPARATOR)) {
      const newField = field.replace(path + RELATIONSHIP_SEPARATOR, "");
      translatedFilter.and_![newField] = filter;
      matchingPath = true;
      break;
    }
  }
  // Keep the attribute as is if no matching relationship path was found
  if (!matchingPath && isRelationship(field)) {
    translatedFilter.and_![field] = filter;
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
    const paths = await dataspace?.relationshipPaths();
    const zoneAboveFilter = generateFilter(zoneAbove);
    if (paths && translatedFilter.and_ && zoneAboveFilter) {
      for (const [field, filter] of Object.entries(zoneAboveFilter.and_ || {})) {
        if (
          // Add the relationship prefix
          object_type! in paths &&
          zoneAbove.object_type! in paths[object_type!]
        ) {
          await handleAddRelationshipPrefix({
            field,
            filter,
            objectType: object_type!,
            zoneAboveObjectType: zoneAbove.object_type!,
            paths,
            dataspace,
            translatedFilter
          });
        } else if (
          // Remove any possible relationship prefix
          zoneAbove.object_type! in paths &&
          object_type! in paths[zoneAbove.object_type!]
        ) {
          await handleRemoveRelationshipPrefix({
            field,
            filter,
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
