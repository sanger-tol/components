/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef, useState } from "react";
import {
  IRemoteTargetAndZone,
  IZone,
  TsDataSource,
  IFilter,
  useEffectUpdate,
  generateFilter,
  resetAllFilters,
  useStateFallback,
  IUseZoneMeta,
  IComponent,
  IView,
  IBoard,
  defineZoneWithComponentList,
  TTranslations,
  createEmptyFilter,
} from "..";

export function useZone(params: {
  objectType: string;
  dataSource: TsDataSource;
  components: IComponent[];
  filter?: IFilter;
}) {
  const { objectType, dataSource, components, filter } = params;
  const [zone, setZone] = useState(
    defineZoneWithComponentList(objectType, components, filter),
  );
  return {
    objectType,
    dataSource,
    zone,
    setZone,
  } as IUseZoneMeta;
}

export function generateAttributeTranslations(
  sourceZone: IZone,
  attributeTranslations?: TTranslations,
  excludeAfterId?: string,
) {
  const sourceFilter = generateFilter(sourceZone, excludeAfterId, true);
  const translatedFilter = createEmptyFilter();
  if (attributeTranslations) {
    Object.entries(attributeTranslations).map(([sourceAttribute, targetAttribute]) => {
      if (sourceFilter?.and_ && sourceAttribute in sourceFilter.and_) {
        translatedFilter.and_[targetAttribute] =
          sourceFilter.and_[sourceAttribute];
      }
    });
  }
  return translatedFilter;
}

export function generateRelationshipTranslations(
  sourceZone: IZone,
  relationshipTranslations?: TTranslations,
  excludeAfterId?: string,
) {
  const translatedFilter = createEmptyFilter();
  return translatedFilter;
}

export function useTranslator(params: {
  source: IUseZoneMeta;
  target: IUseZoneMeta;
  translations: TTranslations;
  excludeAfterId?: string;
  defaultFilter?: IFilter;
}) {
  const { source, target, translations, defaultFilter, excludeAfterId } =
    params;
  const prevFilter: any = useRef(defaultFilter ? defaultFilter : createEmptyFilter());

  useEffectUpdate(() => {
    const translatedFilter = generateAttributeTranslations(
      source.zone,
      translations,
      excludeAfterId,
    );
    if (
      JSON.stringify(translatedFilter) !== JSON.stringify(prevFilter.current)
    ) {
      resetAllFilters(target.zone);
      target.zone.filter = translatedFilter;
      target.setZone({ ...target.zone });
      prevFilter.current = translatedFilter;
    }
  }, [source.zone]);
}

/**
 * A custom hook that provides a fallback mechanism for managing the state of a zone.
 *
 * @param id - The unique identifier for the component.
 * @param objectType - The type of the object associated with the zone.
 * @param zone - The current state of the zone.
 * @param setZone - A function to update the state of the zone.
 *
 * @returns A tuple containing the current state of the zone and a function to update it.
 */
export function useZoneStateFallback({
  id,
  objectType,
  zone,
  setZone,
}: IRemoteTargetAndZone & { id: string }): [any, (state: any) => void] {
  return useStateFallback(
    zone,
    setZone,
    defineZoneWithComponentList(objectType, [{ id: id }]),
  );
}

/**
 * Custom hook for managing board state at different levels (board, view, zone). It initializes state if not already set and provides a setter function to update the state.
 *
 * @param id - The ID of the board element to manage.
 * @param parentStateValue - The current state of the board (IBoard, IView, or IZone).
 * @param setParentStateValue - The setter function to update the board state.
 *
 * @returns A tuple containing the current value of the board element and a setter function to update it.
 */
export function useBoardState<
  TParent extends IBoard | IView | IZone,
  TChildren extends IView | IZone | IComponent
>(
  id: string,
  parentStateValue: TParent,
  setParentStateValue: (newValue: TParent) => void,
): [TChildren, (newValue: TChildren) => void] {
  const value = parentStateValue.children[id] as TChildren;
  const setValue = (newValue: TChildren) => setParentStateValue({
    ...parentStateValue,
    children: {
      ...parentStateValue.children,
      [id]: newValue
    },
  } as TParent);

  return [value, setValue];
}
