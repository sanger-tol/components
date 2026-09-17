/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  createEmptyFilter,
  generateFilter,
  generateAttributeTranslations,
  getSiblingBoardEntity,
  defineBoardEntity,
  mergeFilters,
  BOARD_ENTITIES,
} from "../..";
import type { IZone, IFilter, IView, IBoard, TBoardChildren } from "../..";


/**
 * Returns the nearest zone above the given zone (in the zone order) that does not
 * have `filterPassThrough` enabled. Zones with `filterPassThrough` are skipped
 * because they do not propagate their filter to zones below them.
 *
 * @param id - The id of the current zone.
 * @param view - The view containing all sibling zones.
 * @returns The nearest qualifying zone above, or `null` if none exists.
 */
export function getTranslatorZone(
  id: string,
  view: IView
): IZone | null {
  for (let offset = -1; ; offset--) {
    const candidate = getSiblingBoardEntity(id, view, offset) as IZone | null;
    if (!candidate) return null;
    if (!candidate.filterPassThrough) return candidate;
  }
}

/**
 * Builds a dummy, non-persisted zone from the board's object type and filter.
 * Used to act as a top-level zone above the first real zone of a view, so
 * that zone can still translate an incoming objectType/filter (e.g. supplied
 * via props or query params) even though no real zone exists above it.
 *
 * @param board - The board to derive the top-level object type and filter from.
 * @returns A dummy `IZone` wrapping the board's object type and filter.
 */
export function getTopLevelDummyZone(board: IBoard): IZone | null {
  if (!board.object_type || !board.filter) return null;
  return defineBoardEntity(
    {
      object_type: board.object_type,
      filter: board.filter,
    },
    BOARD_ENTITIES.ENTITIES.ZONE,
  ) as IZone;
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

/**
 * Translates every zone's filter in order, starting from the top-level dummy zone,
 * so the board enters state with its final filters and zones render only once.
 *
 * @param board - The fetched board.
 * @returns The board with each zone's `filter` translated from the zone above it.
 */
export async function translateBoardFilters(board: IBoard): Promise<IBoard> {
  if (!board.order) return board;

  const views: TBoardChildren<IView> = {};
  for (const viewId of board.order) {
    const view = board.children[viewId];
    const zones: TBoardChildren<IZone> = { ...view.children };
    /**
     * The dummy zone is the initial source; each translated zone becomes
     * the source for the next, chaining sequentially down the zone order.
     */
    let zoneAbove = getTopLevelDummyZone(board);

    for (const zoneId of view.order) {
      const zone = zones[zoneId];
      if (zoneAbove) {
        zones[zoneId] = {
          ...zone,
          filter: mergeFilters(
            await translateZoneAboveFilter(zone, zoneAbove),
            zone.defaultFilter,
          ),
        };
      }
      /**
       * Zones with filterPassThrough don't propagate their filter downward,
       * so they're skipped as a source (matches getTranslatorZone's behaviour).
       */
      if (!zones[zoneId].filterPassThrough) zoneAbove = zones[zoneId];
    }
    views[viewId] = { ...view, children: zones };
  }
  return { ...board, children: views };
}
