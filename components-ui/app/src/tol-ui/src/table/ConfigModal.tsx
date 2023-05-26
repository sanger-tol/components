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
        <h2>Toggle and Order Columns</h2>
        {console.log(fieldMeta)}
      </>
    </Modal>
  );
};

export default ConfigModal;
