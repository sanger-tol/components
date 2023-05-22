/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal as RSModal, Button } from 'rsuite';
import React from 'react';

export interface Props {
  size: string,
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<any>>,
  children: JSX.Element
}

const Modal = (props: Props) => {
  const handleClose = () => props.setOpen(false);
  return (
    <>
      {/* @ts-ignore */}
      <RSModal open={props.open} onClose={handleClose} size={props.size}>
        <RSModal.Body>
          {props.children}
        </RSModal.Body>
        <RSModal.Footer>
          <Button onClick={handleClose} appearance="primary">
            Close
          </Button>
        </RSModal.Footer>
      </RSModal>
    </>
  );
};

export default Modal;
