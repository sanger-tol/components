/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { httpClient } from "../../services";
import { ACTION_ENDPOINTS } from "../../constants";
import { DropdownButtonProps } from "../../general/DropdownButtons";


export function addRemoteActions(
  objectType: string,
  setCurrentActionName: (actionName: string) => void,
  setIdExportModalOpen: (open: boolean) => void,
  setIdsWithReqNotMet: (ids: any) => void,
  setLoading: (loading: boolean) => void,
  idsWithReqNotMet: object,
  completeAction: (actionName: string, ids: string[]) => Promise<void>,
  actions: (string | DropdownButtonProps)[] = [],
  baseUrl?: string
) {
  const runAction = async (actionName: string, ids: string[]) => {
    setLoading(true);
    try {
      setCurrentActionName(actionName);
      const itemRequirements = await checkActionHasExportCriteria(actionName);

      if (Object.keys(itemRequirements).length === 0) {
        await completeAction(actionName, ids);
      } else {
        const allItemsMeetCriteria = await checkIdsMeetCriteria(
          ids,
          itemRequirements
        );
        if (!allItemsMeetCriteria) {
          setIdExportModalOpen(true);
        } else {
          await completeAction(actionName, ids);
        }
      }
    } catch (error) {
      console.error("Error running action", error);
    } finally {
      setLoading(false);
    }
  };

  const checkActionHasExportCriteria = async (
    actionName: string
  ): Promise<object> => {
    try {
      const res = await httpClient().get(`/local/${ACTION_ENDPOINTS.GET_ACTIONS}`, {
        baseURL: baseUrl,
        params: {
          filter: {
            and_: {
              name: { eq: { value: actionName } },
            },
          },
        },
      });
      const requirements =
      // @ts-ignore
        res.data.data[0]["attributes"]["params"]["requirements"] || {};
      return requirements;
    } catch (error) {
      console.error(
        "Error fetching data for checking action requirements",
        error
      );
      setLoading(false);
      return {};
    }
  };

  const checkIdsMeetCriteria = async (
    ids: string[],
    itemRequirements: any
  ): Promise<boolean> => {
    try {
      const failedRequirementsMap: Record<string, string[]> = {};
      if (Object.keys(itemRequirements).length === 0) {
        return true;
      }

      for (const [field, conditionStr] of Object.entries(itemRequirements)) {
        const condition = JSON.parse(
          (conditionStr as string).replace(/'/g, '"')
        );

        const filter = {
          and_: {
            id: { in_list: { value: ids } },
            [field]: condition,
          },
        };

        const res = await httpClient().get(`/${objectType}`, {
          baseURL: baseUrl,
          params: { filter: filter },
        });

        //@ts-ignore
        const data = res.data.data;
        const failedIds = ids.filter(
          (id) => !data.map((item: any) => item.id).includes(id)
        );

        if (failedIds.length > 0) {
          failedRequirementsMap[field] = failedIds;
        }
      }

      const allFailingIds = Array.from(
        new Set(Object.values(failedRequirementsMap).flat())
      );

      if (allFailingIds.length === 0) {
        return true;
      }

      setIdsWithReqNotMet({
        ...idsWithReqNotMet,
        _failureDetails: failedRequirementsMap,
      });

      return false;
    } catch (error) {
      console.error(
        "Error fetching data for checking action requirements",
        error
      );
      setLoading(false);
      return false;
    }
  };

  const convertStringAction = (name: string): DropdownButtonProps => {
    return {
      name: name,
      action: (ids: string[]) => runAction(name, ids),
    } as DropdownButtonProps;
  };

  const convertAction = (
    action: string | DropdownButtonProps
  ): DropdownButtonProps => {
    return typeof action === "string" ? convertStringAction(action) : action;
  };

  return actions?.map(convertAction);
}