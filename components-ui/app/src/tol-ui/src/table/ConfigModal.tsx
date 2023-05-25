/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from 'react';
import { Modal } from '../index';
import { isColumnVisible } from "./TableUtils"


export interface Props {
  fieldMeta: object[],
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<any>>
}

function ConfigModal(props: Props) {
  const { fieldMeta, open, setOpen } = props;

  return (
    <Modal
      open={open}
      size='sm'
      setOpen={setOpen}
    >
      <>
      
      </>
    </Modal>
  );
};

export default ConfigModal;
