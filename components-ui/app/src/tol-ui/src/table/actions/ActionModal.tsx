/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Modal,
  ActionStatus,
  RemoteTable,
  TsDataSource,
  useZone,
  env,
  LOCAL_API_DATA_PATH
} from "../..";


interface Props {
  objectType: string; // original table object
  actionDataSource?: TsDataSource; // data source for the action table
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function ActionModal(props: Props) {
  const {
    objectType,
    actionDataSource = new TsDataSource({
      apiPath: env.API_PATH,
      apiDataPath: LOCAL_API_DATA_PATH,
    })
  } = props

  const actionZone = useZone({
    objectType: "user_action",
    dataSource: actionDataSource,
    components: [{ id: "action-table" }],
  });

  return (
    <Modal
      {...props}
      size="full"
      closeButton
    >
      <h5 style={{ paddingBottom: 20 }}>Actions run on '{objectType}'</h5>
      <RemoteTable
        basic
        noConfigModal
        noDownload
        noFilter
        id="action-table"
        height={500}
        defaultSortByAttribute="created_at"
        defaultSortByType="desc"
        cellRenderers={{
          actionStatus: ActionStatus,
        }}
        fields={{
          data: {
            "action.name": {
              rename: "Action",
            },
            ids: {
              rename: "IDs",
              width: 500,
            },
            params: {
              rename: "Status",
              width: 300,
              cellRenderer: {
                type: "actionStatus",
              },
            },
            "user.oidc_id": {
              rename: "User",
            }
          },
          order: {
            active: [
              "action.name",
              "ids",
              "params",
              "user.oidc_id"
            ]
          }
        }}
        {...actionZone}
      />
    </Modal>
  );
}
