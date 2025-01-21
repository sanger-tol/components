/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { 
  Button, 
  Modal,
  SingleSelect,
  TsDataSource,
  env,
} from '../index';
import { Form, InputGroup } from 'react-bootstrap';
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
  viewId: string
}

function ZoneModal(props: Props) {
  const { open, setOpen, setZones, zones, zoneOrder, setZoneOrder, ds, viewId } = props;
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
    const tempDs = new TsDataSource({baseUrl: env.TOL_DATA});
    tempDs.attributeMetadata().then(am => {
      setObjectTypesList(Object.keys(am));
    });
  }, []);

  const onAddZone = async() => {
    if (checkStates()) {
      const orders = zoneOrder.map((zone) => {
        return zone.order;
      })
      const nextOrder = orders.length > 0 ? Math.max(...orders) + 1 : 1;
      const newZone: INewZone = await addZone(ds, objectType, title, nextOrder, viewId);
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

  const plusButton = (
    <Button
      position='right'
      type="success"
      onClick={onAddZone}
      icon='plus'
    />
  );

  return(
    <Modal
      open={open}
      size='sm'
      setOpen={setOpen}
      actionButton={plusButton}
      overflow={false}
      data-testid="zoneModal"
    >
      <>
        <h6>Select Object Type <span style={{color: 'red'}}>*</span></h6>
        <SingleSelect
          data={objectTypesList}
          placeholder='Object Type'
          value={objectType}
          setValue={setObjectType}
          block
        />
        <br/>
        <h6>Enter Title <span style={{color: 'red'}}>*</span></h6>
        <Form>
          <InputGroup>
            <Form.Control
              className='dashboard-modal-input'
              placeholder='Title'
              onChange={(e) => setTitle(e.target.value)}
              isInvalid={titleError}
            />
          </InputGroup>
        </Form>
        {titleError ? <p className='tol-modal-error'>Title cannot be blank</p> : null}
        {fieldError ? <p className='tol-modal-error'>Please ensure all mandatory fields are filled</p> : null}
      </>
    </Modal>
  );
}
  
export default ZoneModal;
