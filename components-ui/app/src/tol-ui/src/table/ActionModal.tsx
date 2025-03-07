/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Button } from "../general";
import Modal from "../general/Modal";
import ActionStatus from "./ActionStatus";
import RemoteTable from "./RemoteTable";

interface Props {
  objectType: string; // original table object
  apiPrefix?: string; // for the action table
  open: boolean;
  setOpen: any;
}

function ActionModal(props: Props) {
  const { objectType } = props
  const [forceUpdate, setForceUpdate] = useState(false);

  // ActionStatus will be cellRenderer at some point
  return (
    <Modal
      {...props}
      size="lg"
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
            cellRenderer: {
              element: ActionStatus,
            }
          },
          "user.oidc_id": {
            rename: "User",
          }
        }}
        forceUpdate={forceUpdate}
      />
      <ActionStatus status="Tester 1234"/>
      <Button
        text="Force Update Table"
        icon="refresh"
        onClick={() => setForceUpdate(!forceUpdate)}
        position="right"
      />
    </Modal>
  );
}

export default ActionModal;
