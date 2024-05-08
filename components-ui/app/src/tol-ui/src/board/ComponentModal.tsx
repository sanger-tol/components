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
  setComponent: any,
}

function ComponentModal(props: Props) {
  const { open, setOpen, setComponent } = props;
  const [chartType, setChartType] = useState('');
  const [chartSize, setChartSize] = useState('');
  const [id, setID] = useState('');

  const addComponent = () => {
    setComponent({
      id: id,
      chartType: chartType,
      chartSize: chartSize
    });
    setOpen(false);
  };

  const plusButton = (
    <Button variant="success" onClick={addComponent}>
      <FontAwesomeIcon icon={faPlus} size="sm" />
    </Button>
  );


  return(
    <Modal
      open={open}
      size='full'
      setOpen={setOpen}
      actionButton={plusButton}
      overflow={false}
    >
      <>
        <SingleSelect
          data={['Table','BarChart','Map', 'Sunburst', 'Count']}
          placeholder='Component'
          value={chartType}
          setValue={setChartType}
        />
        <SingleSelect
          data={['large','medium','small']}
          placeholder='Size'
          value={chartSize}
          setValue={setChartSize}
        />
        <Input 
          placeholder='ID'
          onChange={(value) => setID(value)}
        />
      </>
    </Modal>
  );
}
  
export default ComponentModal;