

/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { 
  Button, 
  Modal,
  SingleSelect,
} from '../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Form, InputGroup } from 'react-bootstrap';

interface Props {
  open: boolean,
  setOpen: any,
  setZones: any,
  zones: object[]
}


function ZoneModal(props: Props) {
  const { open, setOpen, setZones, zones } = props;
  const [objectType, setObjectType] = useState('');
  const [id, setID] = useState('');
  const [idError, setIdError] = useState(false);
  const [fieldError, setFieldError] = useState(false);

  function reset() {
    setObjectType('');
    setID('');
    setIdError(false);
    setFieldError(false);
  }

  function checkStates() {
    setIdError(false);
    setFieldError(false);
    let validId = true;
    let validField = true;
    // @ts-ignore
    if (id === '' || zones.some(zone => zone.id === id)) {
      setIdError(true);
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

  const addZone = () => {
    if (checkStates()) {
      setZones(
        [...zones,
          {
            id: id,
            objectType: objectType,
          }
        ]);
      setOpen(false);
      reset();
    }
  };

  const plusButton = (
    <Button variant="success" onClick={addZone}>
      <FontAwesomeIcon icon={faPlus} size="sm" />
    </Button>
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
          data={['species','sample','specimen', 'extraction', 'sequencing_request', 'run_data']}
          placeholder='Object Type'
          value={objectType}
          setValue={setObjectType}
          block
        />
        <br/>
        <h6>Enter ID <span style={{color: 'red'}}>*</span></h6>
        <Form>
          <InputGroup>
            <Form.Control
              className='dashboard-modal-input'
              placeholder='ID'
              onChange={(e) => setID(e.target.value)}
              isInvalid={idError}
            />
          </InputGroup>
        </Form>
        {idError ? <p className='tol-modal-error'>ID cannot be blank or already exist</p> : null}
        {fieldError ? <p className='tol-modal-error'>Please ensure all mandatory fields are filled</p> : null}
      </>
    </Modal>
  );
}
  
export default ZoneModal;
