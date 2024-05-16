/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { 
  Button, 
  Modal,
  SingleSelect
} from '../index';
import { Input } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';


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

  const addZone = () => {
    setZones(
      [...zones,
        {
          id: id,
          objectType: objectType,
        }
      ]);
    setOpen(false);
    setObjectType('');
    setID('');
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
    >
      <>
        <h6>Select Object Type</h6>
        <SingleSelect
          data={['species','sample','specimen', 'extraction', 'sequencing_request', 'run_data']}
          placeholder='Object Type'
          value={objectType}
          setValue={setObjectType}
          block
        />
        <br/>
        <h6>Enter ID</h6>
        <Input 
          placeholder='ID'
          onChange={(value) => setID(value)}
        />
      </>
    </Modal>
  );
}
  
export default ZoneModal;