
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
import { Zone, addComponent, defineComponent } from './Utils';


interface Props {
  open: boolean,
  setOpen: any,
  zone: Zone,
  setZone: any,
  zoneId: string,
  ds: any,
  currentWidgets: any,
  setCurrentWidgets: any
}

function ComponentModal(props: Props) {
  const { open, setOpen, zone, setZone, zoneId, ds, currentWidgets, setCurrentWidgets } = props;
  const [componentType, setComponentType] = useState('');
  const [widgetType, setWidgetType] = useState('');
  const [title, setTitle] = useState('');
  const [idError, setIdError] = useState(false);
  const [fieldError, setFieldError] = useState(false);

  function reset() {
    setComponentType('');
    setWidgetType('');
    setTitle('');
    setIdError(false);
  }

  function checkStates() {
    setIdError(false);
    setFieldError(false);
    let validId = true;
    let validField = true;
    if (title === '') {
      setIdError(true);
      validId = false;
    }
    if (componentType === '' || widgetType === '') {
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

  const onAddComponent = async () => {
    if (checkStates()) {

      const highestOrder = Object.values(zone.components).reduce((max, component) => {
        return component.data.order! > max ? component.data.order : max;
      }, 0);
      const nextOrder = highestOrder! + 1;
      //All components added are set with portal as baseUrl
      const newComponent = await addComponent(
        ds,
        zone.type!,
        title,
        nextOrder,
        componentType,
        widgetType,
        zoneId
      );
      //This adds the component to the zone
      defineComponent({
        id: newComponent.newComponentId,
        size: widgetType,
        type: componentType,
        order: nextOrder,
      }, zone);
      zone.order = [...zone.order, newComponent.newComponentId];
      // This adds the component to the currentWidgets to be rendered
      setCurrentWidgets([...currentWidgets, {
        componentId: newComponent.newComponentId,
        order: nextOrder,
        componentZoneId: newComponent.newComponentZoneId,
      }]);

      setZone({...zone});
      reset();
      setOpen(false);
    }
  };

  const plusButton = (
    <Button variant="success" onClick={onAddComponent}>
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
      className={"dashboard-component-modal-full"}
    >
      <>
        <h6>Select Component <span style={{color: 'red'}}>*</span></h6>
        <Row>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={componentType !== 'barchart' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => console.log('unavailable')}
            >
              <FontAwesomeIcon icon={faChartColumn} size="6x" />
              <h6>Bar Chart</h6>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={componentType !== 'sunburst' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => console.log('unavailable')}
            >
              <FontAwesomeIcon icon={faChartPie} size="6x" />
              <h6>Sunburst</h6>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={componentType !== 'table' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => setComponentType('table')}
            >
              <FontAwesomeIcon icon={faTable} size="6x" />
              <h6>Table</h6>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className='tol-button-col'>
            <div
              className={componentType !== 'count' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'} 
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
              className={widgetType !== 'sm' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => console.log('unavailable')}
            >
              <h5>Small</h5>
            </div>
          </Col>
          <Col lg={4} md={4} sm={12} className='tol-button-col'>
            <div
              className={widgetType !== 'md' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => console.log('unavailable')}
            >
              <h5>Medium</h5>
            </div>
          </Col>
          <Col lg={4} md={4} sm={12} className='tol-button-col'>
            <div
              className={widgetType !== 'lg' ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
              onClick={() => setWidgetType('lg')}
            >
              <h5>Large</h5>
            </div>
          </Col>
        </Row>
        <br/>
        <h6>Enter Title <span style={{color: 'red'}}>*</span></h6>
        <Form>
          <InputGroup>
            <Form.Control
              className='dashboard-modal-input'
              placeholder='Title'
              onChange={(e) => setTitle(e.target.value)}
              isInvalid={idError}
            />
          </InputGroup>
        </Form>
        {idError ? <p className='tol-modal-error'>Title cannot be blank</p> : null}
        {fieldError ? <p className='tol-modal-error'>Please ensure all mandatory fields are filled</p> : null}
      </>
    </Modal>
  );
}
  
export default ComponentModal;
