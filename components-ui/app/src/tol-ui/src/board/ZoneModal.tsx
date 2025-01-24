/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { 
  Button, 
  Modal,
  SingleSelect,
  TsDataSource
} from '../index';
import { FormTextField } from '../forms';
import { RSForm } from '../index';
import { addZone } from './Utils';


interface OrderObject {
  zoneId: string,
  order: number,
  zoneViewId: string
}

interface INewZone {
  newZoneId: string,
  newZoneViewId: string
}

interface Props {
  open: boolean,
  setOpen: any,
  setZones: any,
  zones: object[],
  setZoneOrder: any,
  zoneOrder: OrderObject[],
  ds: any,
  viewId: string,
  dataUrl?: string;
}

const BOARD_ENDPOINTS = ['board', 'view', 'zone', 'component', 'view_board', 'component_zone', 'zone_view'];
const MISC_ENDPOINTS = ['user', 'user_action', 'action', 'singular']

function ZoneModal(props: Props) {
  const { open, setOpen, setZones, zones, zoneOrder, setZoneOrder, ds, viewId, dataUrl } = props;
  const [objectType, setObjectType] = useState('');
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const [objectTypesList, setObjectTypesList] = useState<string[]>([]);

  function reset() {
    setObjectType('');
    setTitle('');
    setTitleError(false);
    setFieldError(false);
  }

  function checkStates() {
    setTitleError(false);
    setFieldError(false);
    let validId = true;
    let validField = true;
    // @ts-ignore
    if (title === '') {
      setTitleError(true);
      validId = false;
    }
    if (objectType === '' || objectType === null) {
      setFieldError(true);
      validField = false;
    }
    return validId && validField;
  }

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  useEffect(() => {
    const tempDs = new TsDataSource({baseUrl: dataUrl});
    tempDs.attributeMetadata().then(am => {
      setObjectTypesList(Object.keys(am).filter(key => ![...BOARD_ENDPOINTS, ...MISC_ENDPOINTS].includes(key)));
    });
  }, []);

  const onAddZone = async() => {
    if (checkStates()) {
      const orders = zoneOrder.map((zone) => {
        return zone.order;
      })
      const nextOrder = orders.length > 0 ? Math.max(...orders) + 1 : 1;
      const newZone: INewZone = await addZone(ds, objectType, title, nextOrder, viewId, dataUrl);
      setZones(
        [...zones,
          {
            id: newZone.newZoneId,
            objectType: objectType,
            title: title
          }
        ]);
      setZoneOrder(
        [...zoneOrder,
          {
            zoneId: newZone.newZoneId,
            order: nextOrder,
            zoneViewId: newZone.newZoneViewId
          }
        ]);
      reset();
      setOpen(false);
    }
  };

  const actionButtons = (
    <div>
    <Button
      position='right'
      type="success"
      onClick={onAddZone}
      icon='plus'
      text='Add Zone'
    />
    <Button
      position='right'
      type="error"
      onClick={() => setOpen(false)}
      icon='times'
      text='Cancel'
    />
    </div>
  );

  return(
    <div className='confirm-delete-buttons'>
    <Modal
      open={open}
      size='xs'
      setOpen={setOpen}
      actionButton={actionButtons}
      closeButton={false}
      overflow={false}
      data-testid="zoneModal"
    >
      <div>
        <h4>Add New Zone</h4>
        <p className='zone-modal-labels'>Select Object Type <span style={{color: 'red'}}>*</span></p>
        <SingleSelect
          data={objectTypesList}
          placeholder='Object Type'
          value={objectType}
          setValue={setObjectType}
          block
        />
        <br/>
        <p className='zone-modal-labels'>Enter Title <span style={{color: 'red'}}>*</span></p>
        <RSForm fluid>
        <FormTextField
          id="zone-title"
          onChange={(value: any) => setTitle(value)}
          name="Zone Title"
          placeholder={`Zone Title`}
          label=""
        />
      </RSForm>
        {titleError ? <p className='tol-modal-error'>Title cannot be blank</p> : null}
        {fieldError ? <p className='tol-modal-error'>Please ensure all mandatory fields are filled</p> : null}
      </div>
    </Modal>
    </div>
  );
}
  
export default ZoneModal;
