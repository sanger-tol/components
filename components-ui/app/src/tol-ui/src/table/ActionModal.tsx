/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from "../general";
import Modal from "../general/Modal";
import ActionStatus from "./ActionStatus";
// import RemoteTable from "./RemoteTable";

interface Props {
  objectType: string;
  baseUrl?: string;
  open: boolean;
  setOpen: any;
}

function ActionModal(props: Props) {
  const { objectType } = props

  // ActionStatus will be cellRenderer at some point
  return (
    <Modal
      {...props}
      size="lg"
      closeButton
    >
      <h5>Actions run on {objectType}</h5>
      <Button
        text="Force Update Table"
        icon="refresh"
        onClick={() => console.log("Flip the table force update boolean")}
        position="right"
      />
      <div>
        Table here...
      </div>
      <ActionStatus status="Tester 1234"/>
    </Modal>
  );
}

export default ActionModal;
