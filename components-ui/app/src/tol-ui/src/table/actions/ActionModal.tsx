/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Modal,
  ActionStatus,
  RemoteTable,
  TsDataSource,
  useZone
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
      apiPrefix: "local",
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
      <h5 style={{paddingBottom: 20}}>Actions run on '{objectType}'</h5>
      <RemoteTable
        basic
        noConfigModal
        noDownload
        noFilter
        id="action-table"
        height={500}
        defaultSort="-created_at"
        fields={{
          "action.name": {
            rename: "Action",
          },
          ids: {
            rename: "IDs",
            width: 500,
          },
          "status":{
            rename: "Status",
            width: 300,
            custom: true,
            cellRenderer: {
              element: ActionStatus,
            },
          },
          "user.oidc_id": {
            rename: "User",
          }
        }}
        {...actionZone}
      />
    </Modal>
  );
}
