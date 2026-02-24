/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ACTIONS,
  API_METHODS,
  IDropdownButtonConfig,
  PopUpMessage,
  TsDataSource,
} from "../..";

export function addRemoteActions(
  objectType: string,
  dataSource: TsDataSource,
  actionDataSource: TsDataSource,
  setCurrentActionName: (actionName: string) => void,
  setIdExportModalOpen: (open: boolean) => void,
  setIdsWithReqNotMet: (ids: any) => void,
  setLoading: (loading: boolean) => void,
  idsWithReqNotMet: object,
  completeAction: (actionName: string, ids: string[]) => Promise<void>,
  actions: (string | IDropdownButtonConfig)[] = [],
) {
  const runAction = async (actionName: string, ids: string[]) => {
    console.log(ids);
    setLoading(true);
    const formattedIds = 
      ids.map((item: any) => item.key);
    try {
      setCurrentActionName(actionName);
      const itemRequirements = await checkActionHasExportCriteria(actionName);

      if (Object.keys(itemRequirements).length === 0) {
        await completeAction(actionName, formattedIds);
      } else {
        PopUpMessage({
          type: "warning",
          message: "Checking export items meet criteria...",
        });
        const allItemsMeetCriteria = await checkIdsMeetCriteria(
          formattedIds,
          itemRequirements,
        );
        if (!allItemsMeetCriteria) {
          PopUpMessage({
            type: "error",
            message:
              "Some items do not meet criteria. Please check them before exporting.",
          });
          setIdExportModalOpen(true);
        } else {
          PopUpMessage({
            type: "success",
            message: "All items meet criteria. Exporting...",
          });
          await completeAction(actionName, formattedIds).then(() => {
            PopUpMessage({
              type: "success",
              message: `Action "${actionName}" completed successfully.`,
            });
          });
        }
      }
    } catch (error) {
      PopUpMessage({
        type: "error",
        message: `Error running action "${actionName}": ${error.message}`,
      });
      console.error("Error running action", error);
    } finally {
      setLoading(false);
    }
  };

  const checkActionHasExportCriteria = async (
    actionName: string,
  ): Promise<object> => {
    try {
      const res = await actionDataSource.custom({
        method: API_METHODS.GET,
        resource: ACTIONS.ACTION,
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
        error,
      );
      setLoading(false);
      return {};
    }
  };

  const checkIdsMeetCriteria = async (
    ids: string[],
    itemRequirements: any,
  ): Promise<boolean> => {
    try {
      const failedRequirementsMap: Record<string, string[]> = {};
      if (Object.keys(itemRequirements).length === 0) {
        return true;
      }

      const requests = Object.entries(itemRequirements).map(
        async ([field, conditionStr]) => {
          const filter = {
            and_: {
              id: { in_list: { value: ids } },
              [field]: conditionStr, // e.g. "sts_species.id": { eq: { value: "some_value" } }
            },
          };

          const res = await dataSource.custom({
            method: API_METHODS.GET,
            resource: objectType,
            params: { filter: filter },
          });

          // @ts-ignore
          const data = res.data.data;
          const failedIds = ids.filter(
            (id) => !data.map((item: any) => item.id).includes(id),
          );

          if (failedIds.length > 0) {
            failedRequirementsMap[field] = failedIds;
          }
        },
      );

      await Promise.all(requests);

      const allFailingIds = Array.from(
        new Set(Object.values(failedRequirementsMap).flat()),
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
        error,
      );
      setLoading(false);
      return false;
    }
  };

  const convertStringAction = (name: string): IDropdownButtonConfig => {
    return {
      name: name,
      action: (ids: string[]) => runAction(name, ids),
    } as IDropdownButtonConfig;
  };

  const convertAction = (
    action: string | IDropdownButtonConfig,
  ): IDropdownButtonConfig => {
    return typeof action === "string" ? convertStringAction(action) : action;
  };

  return actions?.map(convertAction);
}
