/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import Modal from "../general/Modal";

interface Props {
  open: boolean;
  setOpen: any;
}

function ActionModal(props: Props) {
  // const {  } = props;

  return (
    <Modal
      {...props}
      size="lg"
      closeButton
    >
      <>Tester</>
    </Modal>
  );
}

export default ActionModal;
