/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import Modal from "../general/Modal";
// import RemoteTable from "./RemoteTable";

interface Props {
  objectType: string;
  baseUrl?: string;
  open: boolean;
  setOpen: any;
}

function ActionModal(props: Props) {
  const { objectType } = props;

  return (
    <Modal
      {...props}
      size="lg"
      closeButton
    >
      <h5>Actions run on {objectType}</h5>
      <>Table here...</>
    </Modal>
  );
}

export default ActionModal;
