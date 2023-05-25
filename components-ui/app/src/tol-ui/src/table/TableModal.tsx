/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from 'react';
import { Modal } from '../index';
import { isColumnVisible } from "./TableUtils"


export interface Props {
  columns: object[],
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<any>>
}

function TableModal(props: Props) {
  const { columns, open, setOpen } = props;

  return (
    <Modal
      open={open}
      size='sm'
      setOpen={setOpen}
    >
      <>
        <h2>Toggle Columns</h2>
        {console.log(columns)}
        {columns.map(column => {
          if (isColumnVisible(column)) {
            return <li>{column['text']}</li>
          } else {
            return <li>{column['text']}__HIDDEN</li>
          }
        })}
      </>
    </Modal>
  );
};

export default TableModal;
