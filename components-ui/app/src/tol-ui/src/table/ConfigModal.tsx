/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from '../index';
import React from 'react';
import { Modal } from '../index';
import { normaliseCaps } from '../general/Utils';
import { isColumnVisible } from "./TableUtils"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';


export interface Props {
  fieldMeta: object,
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<any>>,
  modalOnSave: Function
}

function ConfigModal(props: Props) {
  const { fieldMeta, open, setOpen, modalOnSave } = props;

  const randomHiddenTemp = (fieldMeta: object) => {
    for (const key of Object.keys(fieldMeta)) {
      const bool = Math.floor(Math.random() * (2 - 1 + 1)) + 1
      if (bool === 1) {
        fieldMeta[key].hidden = true
      } else {
        fieldMeta[key].hidden = false
      }
    }
    return fieldMeta
  }

  const saveConfig = () => {
    modalOnSave(randomHiddenTemp(fieldMeta))
    setOpen(false)
  }

  const saveButton = (
    <Button variant="success" onClick={saveConfig}>
      <FontAwesomeIcon icon={faFloppyDisk} size="sm" />
    </Button>
  )

  return (
    <Modal
      open={open}
      size='lg'
      setOpen={setOpen}
      actionButton={saveButton}
    >
      <>
        <h2>Toggle and Order Columns</h2>
        {Object.keys(fieldMeta).map(key => {
          const field = fieldMeta[key]
          if (isColumnVisible(field)) {
            return <p key={key} style={{color: "red"}}>{normaliseCaps(key)}</p>
          }
          return <p key={key}>{normaliseCaps(key)}</p>
        })}
      </>
    </Modal>
  );
};

export default ConfigModal;