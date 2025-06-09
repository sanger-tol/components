/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  TsDataSource,
  TDataObjectListOrNull,
  TDataObjectOrNull,
  BOARDS,
} from "../..";


export async function getBoardDetails (
  boardDataSource: TsDataSource,
  userId: string,
  setErrorMessage: any
) {
  return boardDataSource
    .getListPage({
      objectType: BOARDS.BOARD,
      filter: {
        and_: {
          user_id: { eq: { value: userId } },
        },
      },
    })
    .then((data: TDataObjectListOrNull) => {
      return data?.map((board: TDataObjectOrNull) => ({
        id: board?.id,
        title: board?.title,
      }));
    })
    .catch((error: any) => {
      console.error("Error fetching boards:", error);
      setErrorMessage("Error fetching boards. Please try again later.");
    });
};

export function useItemData<T,> (
  ids: string[],
  fetchFunction: (id: string) => Promise<T> | T,
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
          }),
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
  }, [ids, fetchFunction]);

  return { itemData, loading };
};


const returnViewInfo = async (viewId: string) => {
  try {
    const res: any = await httpClient().get(`/${BOARDS.VIEW}`, {
      params: {
        filter: {
          and_: {
            id: { eq: { value: viewId } },
          },
        },
      },
    });
    return res.data.data[0].attributes.title;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const returnZoneInfo = async (zoneId: string) => {
  try {
    const res: any = await httpClient().get(`/${BOARDS.ZONE}`, {
      params: {
        filter: {
          and_: {
            id: { eq: { value: zoneId } },
          },
        },
      },
    });
    return res.data.data.map((item: any) => ({
      title: item.attributes.title,
      objectType: item.attributes.object_type,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

const returnComponentInfo = async (componentId: string) => {
  try {
    const res: any = await httpClient().get(`/${BOARDS.COMPONENT}`, {
      params: {
        filter: {
          and_: {
            id: { eq: { value: componentId } },
          },
        },
      },
    });
    return res.data.data.map((item: any) => ({
      title: item.attributes.title,
      componentType: item.attributes.component_type,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchSubItemId = async (
  id: string,
  endpointUrl?: string,
  filterItem?: string,
  itemType?: any,
) => {
  try {
    const res: any = await httpClient().get(`/${endpointUrl}`, {
      params: {
        filter: {
          and_: {
            [`${filterItem}`]: { eq: { value: id } },
          },
        },
      },
    });
    return res.data.data.map((item: any) => ({
      id: item.relationships[itemType].data.id,
      order: item.attributes.order,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};