
/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useEffect } from 'react';
import { 
  Button, 
  Modal,
  Row,
  Col,
} from '../index';
import { Form, InputGroup } from 'react-bootstrap';
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
  const [idError, setIdError] = useState(false);
  const [fieldError, setFieldError] = useState(false);

  function reset() {
    setChartType('');
    setChartSize('');
    setId('');
    setIdError(false);
  }

  function checkStates() {
    setIdError(false);
    setFieldError(false);
    let validId = true;
    let validField = true;
    if (id === '' || zone.components[id] !== undefined) {
      setIdError(true);
      validId = false;
    }
    if (chartType === '' || chartSize === '') {
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

  const addComponent = () => {
    if (checkStates()) {
      defineComponent({
        id: id,
        size: chartSize,
        type: chartType,
      }, zone);
      zone.order = [...zone.order, id];
      setZone({...zone});
      setOpen(false);
      reset();
    }
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
        <h6>Select Component <span style={{color: 'red'}}>*</span></h6>
        <Row>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={chartType !== 'barchart' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => console.log('unavailable')}
            >
              <FontAwesomeIcon icon={faChartColumn} size="6x" />
              <h6>Bar Chart</h6>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={chartType !== 'sunburst' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => console.log('unavailable')}
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
              onClick={() => console.log('unavailable')}
            >
              <FontAwesomeIcon icon={faHashtag} size="6x" />
              <h6>Count</h6>
            </div>
          </Col>
        </Row>
        <br/>
        <h6>Select Size <span style={{color: 'red'}}>*</span></h6>
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
        <h6>Enter ID <span style={{color: 'red'}}>*</span></h6>
        <Form>
          <InputGroup>
            <Form.Control
              className='dashboard-modal-input'
              placeholder='ID'
              onChange={(e) => setId(e.target.value)}
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
  
export default ComponentModal;
