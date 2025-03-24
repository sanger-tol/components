/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import Modal from "../../general/Modal";
import ActionStatus from "./ActionStatus";
import RemoteTable from "../RemoteTable";
import { useEffect } from "react";

interface Props {
  objectType: string; // original table object
  apiPrefix?: string; // for the action table
  open: boolean;
  setOpen: (open: boolean) => void;
}

function ActionModal(props: Props) {
  const { objectType } = props

  // ActionStatus will be cellRenderer at some point
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
        endpoint="local/user_action"
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
      />
    </Modal>
  );
}

export default ActionModal;
