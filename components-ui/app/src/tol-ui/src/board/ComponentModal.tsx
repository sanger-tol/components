/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { 
  Button, 
  Modal,
  Row,
  Col
} from '../index';
import { Input } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChartColumn, faChartPie, faTable, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { Zone, defineComponent } from './Utils';


interface Props {
  open: boolean,
  setOpen: any,
  zone: Zone,
  setZone: any
}

function ComponentModal(props: Props) {
  const { open, setOpen, zone, setZone } = props;
  const [chartType, setChartType] = useState('');
  const [chartSize, setChartSize] = useState('');
  const [id, setId] = useState('');

  const addComponent = () => {
    defineComponent({
      id: id,
      size: chartSize,
      type: chartType,
    }, zone)
    zone.order = [...zone.order, id];
    setZone({...zone});
    setOpen(false);
    setChartType('');
    setChartSize('');
    setId('');
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
        <h6>Select Component</h6>
        <Row>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={chartType !== 'barchart' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => setChartType('barchart')}
            >
              <FontAwesomeIcon icon={faChartColumn} size="6x" />
              <h6>Bar Chart</h6>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={chartType !== 'sunburst' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => setChartType('sunburst')}
            >
              <FontAwesomeIcon icon={faChartPie} size="6x" />
              <h6>Sunburst</h6>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={chartType !== 'table' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => setChartType('table')}
            >
              <FontAwesomeIcon icon={faTable} size="6x" />
              <h6>Table</h6>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={chartType !== 'count' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'} 
              onClick={() => setChartType('count')}
            >
              <FontAwesomeIcon icon={faHashtag} size="6x" />
              <h6>Count</h6>
            </div>
          </Col>
        </Row>
        <br/>
        <h6>Select Size</h6>
        <Row>
          <Col lg={4} md={4} sm={12} className='tol-button-col'>
            <div
              className={chartSize !== 'small' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => setChartSize('small')}
            >
              <h5>Small</h5>
            </div>
          </Col>
          <Col lg={4} md={4} sm={12} className='tol-button-col'>
            <div
              className={chartSize !== 'medium' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => setChartSize('medium')}
            >
              <h5>Medium</h5>
            </div>
          </Col>
          <Col lg={4} md={4} sm={12} className='tol-button-col'>
            <div
              className={chartSize !== 'large' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => setChartSize('large')}
            >
              <h5>Large</h5>
            </div>
          </Col>
        </Row>
        <br/>
        <h6>Enter ID</h6>
        <Input
          placeholder='ID'
          onChange={(value) => setId(value)}
        />
      </>
    </Modal>
  );
}
  
export default ComponentModal;