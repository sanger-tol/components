/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  IFilter,
  IFilterOperators,
  TRelationshipPaths,
  TsDataSource,
} from "..";


export interface IFieldTranslationParams {
  /**
   * The attribute (field) to be translated.
   * e.g. "species.scientific_name"
   */
  field: string;
  /**
   * The filter value associated with the attribute to be translated.
   */
  filterValue: IFilterOperators;
  /**
   * The object type of the current zone.
   */
  objectType: string;
  /**
   * The object type of the zone above the current zone.
   */
  zoneAboveObjectType: string;
  /**
   * The relationship paths between object types in the dataspace.
   */
  paths: TRelationshipPaths;
  /**
   * The dataspace from which the zones are sourced.
   */
  dataspace?: TsDataSource;
  /**
   * The translated filter for the current zone, which will be modified in place.
   */
  translatedFilter: IFilter;
}
