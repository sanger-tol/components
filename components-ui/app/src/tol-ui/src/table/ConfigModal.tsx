/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { DnD, InfoTooltip } from '../index';
import { useState } from 'react';
import { Modal } from '../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faDiagramProject, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FieldMeta, initialiseFieldMeta } from './Field';
import { Row, Button, Col } from 'react-bootstrap';
import { deleteFieldMetaLocalStorage, getSourceColour, sortFieldsByRename } from './Utils';
import { normaliseCaps } from '../general/Utils';


export interface Props {
  tableId: string,
  fieldMeta: FieldMeta,
  open: boolean,
  setOpen: any,
  pageSize?: number,
  displaySource?: boolean,
  onModalSave: (fieldMeta: FieldMeta) => void
}

function ConfigModal(props: Props) {
  const { tableId, fieldMeta, open, setOpen, onModalSave, pageSize, displaySource } = props;
  const [contents, setContents] = useState({});

  const updateMeta = (list: object[], updatedFieldMeta: FieldMeta, hidden: boolean) => {
    for (const element of Object.values(list)) {
      const id = element!['id'];
      const isActive = hidden ? 'inactive' : 'active';
      updatedFieldMeta.order[isActive].push(id);
      // make a copy and update visibility
      updatedFieldMeta.data[id] = fieldMeta.data[id];
      updatedFieldMeta.data[id].hidden = hidden;
    }
  };

  const fieldMetaUpdatedByContents = () => {
    const updatedFieldMeta: FieldMeta = initialiseFieldMeta();
    // loop through columns and set active/inactive
    for (const column of Object.values(contents)) {
      const id = column!['id'];
      const list = column!['list'];
      if (id === 'Active') {
        updateMeta(list, updatedFieldMeta, false);
      } else if (id === 'Inactive') {
        updateMeta(list, updatedFieldMeta, true);
      }
    }
    // sort order of inactive alphabetically
    updatedFieldMeta.order.inactive = sortFieldsByRename(updatedFieldMeta);
    return updatedFieldMeta;
  };

  const uiElement = (key: string, meta: object) => {
    const sourceColour = getSourceColour(meta['source']);
    return (
      <div className='tol-dnd-item'>
        {meta['description'] &&
          <span className='info'>
            <InfoTooltip contents={meta['description']} />
          </span>
        }
        {meta['rename']}
        {displaySource ? (
          <div className='config-source'
            // @ts-ignore
            style={{ '--config-source-bg-color': sourceColour }}
          >
            {normaliseCaps(meta['source'])}
          </div>
        ) : null}
        {!meta['isAttribute'] && <FontAwesomeIcon className='icon' icon={faDiagramProject} size="xs" />}
        <div className='field-name-origin'>{key}</div>
      </div>
    );
  };

  const fieldMetaItemToElement = (isActive: string) => {
    const items: object[] = [];
    for (const key of fieldMeta.order[isActive]) {
      items.push({
        id: key,
        element: uiElement(key, fieldMeta.data[key])
      });
    }
    return items;
  };

  const fieldMetaToElements = () => {
    const elements: object = {};
    elements['Active'] = fieldMetaItemToElement('active');
    elements['Inactive'] = fieldMetaItemToElement('inactive');
    return elements;
  };

  const dealWithContents = (column: object) => {
    if (column['id'] === "Active") {
      if (column['list'].length === 0) {
        return false;
      }
    }
    return true;
  };

  const saveConfig = () => {
    const updatedFieldMeta = fieldMetaUpdatedByContents();
    onModalSave(updatedFieldMeta);
    setOpen(false);
  };

  const saveButton = (
    <Button variant="success" onClick={saveConfig}>
      <FontAwesomeIcon icon={faFloppyDisk} size="sm" />
    </Button>
  );

  const header = (
    <>
      <Row style={{ marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0}}>
        <Col sm={6} style={{ paddingLeft: 0, paddingRight: 0 }}>
          <h2>Table Configuration</h2>
        </Col>
        <Col sm={6} style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Button
            className="clear-saved-config"
            style={{float: "right", display: "none"}} // hidden for now
            variant="warning"
            onClick={() => {
              deleteFieldMetaLocalStorage(tableId);
            }}
          >
            Clear and Reset
            <FontAwesomeIcon icon={faTrash} size="sm" />
          </Button>
        </Col>
      </Row>
      <hr/>
    </>
  )

  return (
    <Modal
      open={open}
      size='full'
      setOpen={setOpen}
      header={header}
      actionButton={saveButton}
      className={"config-modal-overflow-fix"}
      overflow={true}
    >
      <DnD
        elements={fieldMetaToElements()}
        setContents={setContents}
        dealWithContents={dealWithContents}
      />
    </Modal>
  );
}

export default ConfigModal;
