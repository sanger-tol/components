
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
  Icon,
  HoverOverlay,
  env,
  TsDataSource
} from '../index';
import { Form, InputGroup } from 'react-bootstrap';
import { Zone, addComponent, defineComponent } from './Utils';


interface Props {
  open: boolean,
  setOpen: any,
  zone: Zone,
  setZone: any,
  zoneId: string,
  ds: TsDataSource,
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
        zoneId,
        env.TOL_DATA
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

        componentType: componentType,
        filter: {and_: {}},
        title: title,
        objectType: zone.type,
        baseUrl: env.TOL_DATA,
        config: {},
        widgetType: widgetType
      }]);

      setZone({...zone});
      reset();
      setOpen(false);
    }
  };

  const plusButton = (
    <Button
      type="success"
      onClick={onAddComponent}
      icon='plus'
      position='right'
    />
  );

  const componentOptions = [
    {
      type: 'count',
      icon: 'hashtag',
      disabled: true
    },
    {
      type: 'barchart',
      icon: 'chart-column',
      disabled: true
    },
    {
      type: 'sunburst',
      icon: 'chart-pie',
      disabled: true
    },
    {
      type: 'table',
      icon: 'table',
      disabled: false
    }
  ]

  const sizeOptions = [
    {
      type: 'sm',
      name: 'Small',
      disabled: true
    },
    {
      type: 'md',
      name: 'Medium',
      disabled: false
    },
    {
      type: 'lg',
      name: 'Large',
      disabled: false
    }
  ]


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
          {componentOptions.map((option, index) => {
            const content = (
              <>
                <Icon icon={option.icon} size="6x" />
                <h6>{option.type}</h6>
              </>
            )
            return (
              <Col lg={3} md={6} sm={12} className='tol-button-col' key={index}>
                {!option.disabled ?
                 <div
                  className={componentType !== option.type ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
                  onClick={() => setComponentType(option.type)}
                 >
                  {content}
                </div>
                :
                <HoverOverlay contents={'Coming Soon...'}>
                  <div
                    className={'tol-component-modal-bttn-disabled'}
                    onClick={() => console.log('unavailable')}
                   >
                    {content}
                  </div>
                </HoverOverlay>
                }
              </Col>
            )
          })}
        </Row>
        <br/>
        <h6>Select Size <span style={{color: 'red'}}>*</span></h6>
        <Row>
          {sizeOptions.map((option, index) => {
            return (
              <Col lg={4} md={4} sm={12} className='tol-button-col' key={index}>
                {!option.disabled ?
                <div
                  className={widgetType !== option.type ? 'tol-component-modal-bttn' : 'tol-component-modal-bttn-clicked'}
                  onClick={() => setWidgetType(option.type)}
                >
                  <h5>{option.name}</h5>
                </div>
                :
                <HoverOverlay contents={'Coming Soon...'}>
                  <div
                    className={'tol-component-modal-bttn-disabled'}
                    onClick={() => console.log('unavailable')}
                  >
                    <h5>{option.name}</h5>
                  </div>
                </HoverOverlay>
                }
              </Col>
            )
          })}
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
