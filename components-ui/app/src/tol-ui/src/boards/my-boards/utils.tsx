/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  TsDataSource,
  TDataObjectListOrNull,
  TDataObjectOrNull,
  BOARD_ENTITIES,
  TNavConfig,
  isDropdown,
  isPageElementReference,
} from "../..";

/**
 * Checks whether a board ID is referenced by a page at any level of a navigation config.
 *
 * @param navConfig - The navigation configuration to search.
 * @param boardId - The board ID to find.
 * @returns Whether the board is present in the navigation configuration.
 */
export function isBoardInNavConfig(
  navConfig: TNavConfig | undefined,
  boardId: string,
): boolean {
  if (!navConfig) return false;

  return Object.values(navConfig.data).some((navItem) => {
    if (
      isPageElementReference(navItem.path) &&
      navItem.path.pageElementReference === boardId
    ) {
      return true;
    }

    return isDropdown(navItem) && isBoardInNavConfig(navItem.pages, boardId);
  });
}

export async function getBoardDetails(
  boardDataSource: TsDataSource,
  userId: string,
  setErrorMessage: any,
) {
  return boardDataSource
    .getListPage({
      objectType: BOARD_ENTITIES.ENTITIES.BOARD,
      filter: {
        and_: {
          user_id: { eq: { value: userId } },
        },
      },
    })
    .then((data: TDataObjectListOrNull) => {
      return data
        ?.map((board: TDataObjectOrNull) => ({
          id: board?.id,
          title: board?.title,
        }))
        .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    })
    .catch((error: any) => {
      console.error("Error fetching boards:", error);
      setErrorMessage("Error fetching boards. Please try again later.");
    });
}

export function useItemData<T>(
  ids: string[],
  fetchFunction: (id: string) => Promise<T> | T
) {
  const [itemData, setItemData] = useState<{ [key: string]: T }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchItems = async () => {
      setLoading(true);

      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const data = await fetchFunction(id);
            return { [id]: data };
          })
        );

        if (mounted) {
          setItemData(Object.assign({}, ...results));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      mounted = false;
    };
  }, [ids]);

  return { itemData, loading };
}

export async function returnViewInfo(
  boardDataSource: TsDataSource,
  viewId: string,
) {
  return boardDataSource
    .getListPage({
      objectType: BOARD_ENTITIES.ENTITIES.VIEW,
      filter: {
        and_: {
          id: { eq: { value: viewId } },
        },
      },
    })
    .then((data: TDataObjectListOrNull) => {
      return data?.[0]?.title; // temporary assumption - only one view per ID
    })
    .catch((error: any) => {
      console.error("Error fetching view info:", error);
      return [];
    });
}

export async function returnZoneInfo(
  boardDataSource: TsDataSource,
  zoneId: string,
) {
  return boardDataSource
    .getListPage({
      objectType: BOARD_ENTITIES.ENTITIES.ZONE,
      filter: {
        and_: {
          id: { eq: { value: zoneId } },
        },
      },
    })
    .then((data: TDataObjectListOrNull) => {
      return data?.map((item: TDataObjectOrNull) => ({
        title: item?.title,
        objectType: item?.object_type,
      }));
    })
    .catch((error: any) => {
      console.error("Error fetching zone info:", error);
      return [];
    });
}

export async function returnComponentInfo(
  boardDataSource: TsDataSource,
  componentId: string,
) {
  return boardDataSource
    .getListPage({
      objectType: BOARD_ENTITIES.ENTITIES.COMPONENT,
      filter: {
        and_: {
          id: { eq: { value: componentId } },
        },
      },
    })
    .then((data: TDataObjectListOrNull) => {
      return data?.map((item: TDataObjectOrNull) => ({
        title: item?.title,
        componentType: item?.component_type,
      }));
    })
    .catch((error: any) => {
      console.error("Error fetching component info:", error);
      return [];
    });
}

export async function fetchSubItemId(
  id: string,
  objectType: string,
  boardDataSource: TsDataSource,
  filterKey: string,
  itemType: any
) {
  return boardDataSource
    .getListPage({
      objectType,
      filter: {
        and_: {
          [filterKey]: { eq: { value: id } },
        },
      },
    })
    .then(async (data: TDataObjectListOrNull) => {
      return await Promise.all(
        data?.map(async (item: TDataObjectOrNull) => {
          const relationshipData = await item?.fetchRelationships?.[itemType];
          return {
            id: relationshipData?.["id"],
            order: item?.order,
          };
        }) || [],
      );
    })
    .catch((error: any) => {
      console.error(error);
      return [];
    });
}
