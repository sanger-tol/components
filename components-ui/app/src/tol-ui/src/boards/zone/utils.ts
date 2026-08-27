/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  createEmptyFilter,
  generateFilter,
  generateAttributeTranslations,
  getSiblingBoardEntity,
} from "../..";
import type { IZone, IFilter, IView } from "../..";


/**
 * Returns the nearest zone above the given zone (in the zone order) that does not
 * have `filterPassThrough` enabled. Zones with `filterPassThrough` are skipped
 * because they do not propagate their filter to zones below them.
 *
 * @param id - The id of the current zone.
 * @param view - The view containing all sibling zones.
 * @returns The nearest qualifying zone above, or `null` if none exists.
 */
export function getTranslatorZone(id: string, view: IView): IZone | null {
  for (let offset = -1; ; offset--) {
    const candidate = getSiblingBoardEntity(id, view, offset) as IZone | null;
    if (!candidate) return null;
    if (!candidate.filterPassThrough) return candidate;
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
  zoneAbove: IZone,
): Promise<IFilter> {
  let translatedFilter: IFilter = createEmptyFilter();

  /**
   * If the current zone has filterExcludeIncoming set to true or there is no zone above,
   * return an empty filter to prevent any incoming filters from being applied.
   */
  if (currentZone.filterExcludeIncoming || !zoneAbove) return translatedFilter;

  // Get various properties needed for translation
  const { object_type, dataspace } = currentZone;
  const zoneAboveFilter = generateFilter(zoneAbove);

  if (zoneAboveFilter) {
    /**
     * Add the custom translations to the translated filter if they exist.
     */
    translatedFilter =
      generateAttributeTranslations(zoneAbove, currentZone.attributeTranslations);

    if (currentZone.relationshipTranslation) {
      for (const [incomingField, filterValue] of Object.entries(zoneAboveFilter.and_ || {})) {
        // If the incoming field already exists in the attribute translations, skip automatic translation
        if (incomingField in currentZone.attributeTranslations!) continue;

        // Attempt to find a relationship path for the incoming field
        const translatedField = await dataspace?.findShortestRelationshipField(
          incomingField,
          zoneAbove.object_type!,
          object_type!
        );

        // If a relationship path is found, add the translated field to the translated filter
        if (translatedField && translatedFilter.and_) {
          translatedFilter.and_[translatedField] = filterValue;
        }
      }
    }
  }
  return translatedFilter;
}
