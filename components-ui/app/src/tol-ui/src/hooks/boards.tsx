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
  TChildrenKey,
  defineZoneWithComponentList,
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

export function generateTranslatedFilter(
  source: IUseZoneMeta,
  translations: {
    [sourceAttribute: string]: string;
  },
  excludeAfterId?: string,
) {
  const sourceFilter = generateFilter(source.zone, excludeAfterId, true);
  const translatedFilter = { and_: {} };
  Object.entries(translations).map(([sourceAttribute, targetAttribute]) => {
    if (sourceFilter?.and_ && sourceAttribute in sourceFilter.and_) {
      translatedFilter.and_[targetAttribute] =
        sourceFilter.and_[sourceAttribute];
    }
  });
  return translatedFilter;
}

export function useTranslator(params: {
  source: IUseZoneMeta;
  target: IUseZoneMeta;
  translations: {
    [sourceAttribute: string]: string;
  };
  excludeAfterId?: string;
  defaultFilter?: IFilter;
}) {
  const { source, target, translations, defaultFilter, excludeAfterId } =
    params;
  const prevFilter: any = useRef(defaultFilter ? defaultFilter : { and_: {} });

  useEffectUpdate(() => {
    const translatedFilter = generateTranslatedFilter(
      source,
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
 * @param boardLevel - The level of the board to manage (e.g zone will be 'zones' so it can see its siblings).
 * @param id - The ID of the board element to manage.
 * @param parentStateValue - The current state of the board (IBoard, IView, or IZone).
 * @param setParentStateValue - The setter function to update the board state.
 * @param initialSetup - Optional initial setup for the board element if it doesn't already exist in the state.
 *
 * @returns A tuple containing the current value of the board element and a setter function to update it.
 */
export function useBoardState<
  TParent extends IBoard | IView | IZone,
  TChildren extends IView | IZone | IComponent,
>(
  boardLevel: TChildrenKey,
  id: string,
  parentStateValue: TParent,
  setParentStateValue: (newValue: TParent) => void,
): [TChildren, (newValue: TChildren) => void, Record<string, TChildren>] {
  const childrenMap = (parentStateValue?.children?.[0] ?? {});
  const value = childrenMap[id] as TChildren;
  const childrenOfValue = (value as any)?.children?.[0] ?? [];

  const setValue = (newValue: TChildren) => {
    setParentStateValue({
      ...parentStateValue,
      [boardLevel]: {
        ...parentStateValue[boardLevel],
        [id]: newValue,
      } as TParent,
    });
  };
  return [value, setValue, childrenOfValue];
}
