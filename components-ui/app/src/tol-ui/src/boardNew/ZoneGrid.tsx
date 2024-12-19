/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Button, 
  useZone, 
  ResponsiveWidget, 
  env,
  ComponentModal,
  EditableTitle,
} from '../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPlus,
  faArrowUp,
  faArrowDown,
  faPenToSquare,
  faCheck,
  faUpDownLeftRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  getComponents,
  onTitleSave
} from './Utils';
import { ConfirmationModal } from './components';

interface Widgets {
  componentId: string,
  order: string,
  componentZoneId: string,
  componentType: string,
}

interface Props {
  id: string,
  title?: string,
  objectType: string,
  onZoneReorder: any,
  deleteZone: any,
  ds?: any
}

function ZoneGrid(props: Props) {
  const { id, objectType, onZoneReorder, deleteZone, ds } = props;
  const [draggable, setDraggable] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widgets[]>([]);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editBtnsVisible, setEditBtnsVisible] = useState(false);
  const z = useZone({
    endpoint: objectType,
    baseUrl: env.TOL_DATA,
    components: []
  });

  const handleSetDraggable = () => {
    setDraggable(!draggable);
  };

  const handleOpenModal = () => {
    setConfirmationModalOpen(true);
  };

  const handleBtnsVisible = () => {
    setEditBtnsVisible(!editBtnsVisible);
  };

  //useEffectUpdate(() => {
  //  setCurrentWidgets(getWidgetsUsingZone());
  //}, [z.zone]);

  const confirmationModal = (
    <ConfirmationModal
      setOpen={setConfirmationModalOpen}
      open={confirmationModalOpen}
      onConfirmClick={() => deleteZone(id)}
      itemType={"zone"}
    />
  );

  useEffect(() => {
    getComponents(id, ds).then((res: any) => {
      setCurrentWidgets(res);
      res.forEach((widget) => {
        z.zone.components[widget.componentId] = {
          data: {
            defaultFilter: {and_: {}},
            filter: {and_: {}},
            id: widget.componentId,
          }
        };
        z.zone.order.push(widget.componentId);
      })
    })
  }, []);


  const onAddComponent = () => {
    setOpen(true);
  };

  const editButton = (
    <Button
      onClick={() => {
        setDraggable(!draggable);
      }}
      disabled={currentWidgets.length < 1}
      className="zone-edit-button"
    >
      <FontAwesomeIcon icon={faUpDownLeftRight} size="sm" />
    </Button>
  );

  const addButton = (
    <Button
      onClick={() => {
        onAddComponent();
      }}
      className='zone-config-button'
      variant="success"
    >
      <FontAwesomeIcon icon={faPlus} size="sm" />
    </Button>
  );

  const deleteButton = (
    <Button
      onClick={() => {
        handleOpenModal();
      }}
      className={'zone-config-button'}
      variant="danger"
    >
      <FontAwesomeIcon icon={faTrash} size="sm" />
    </Button>
  );

  const upButton = (
    <Button
      onClick={async () => {
        await onZoneReorder(id, 'up');
      }}
      className='zone-config-button'
    >
      <FontAwesomeIcon icon={faArrowUp} size="sm" />
    </Button>
  );
  
  const downButton = (
    <Button
      onClick={async () => {
        await onZoneReorder(id, 'down');
      }}
      className='zone-config-button'
    >
      <FontAwesomeIcon icon={faArrowDown} size="sm" />
    </Button>
  );

  const showEditButtons = (
    <Button
      onClick={() => {
        handleBtnsVisible();
      }}
      variant="primary"
      className="zone-config-button"
      style={{
        width: "60px",
        backgroundColor: editBtnsVisible ? "green" : "orange",
        borderColor: editBtnsVisible ? "green" : "orange",
      }}
    >
      {editBtnsVisible ? (
        <FontAwesomeIcon icon={faCheck} size="sm" />
      ) : (
        <FontAwesomeIcon icon={faPenToSquare} size="sm" />
      )}
    </Button>
  );

  const buttons = (
    <div className='tol-zone-bar'>
      <Row>
        <Col>
          <EditableTitle title={props.title!} onSave={(newTitle) => onTitleSave(newTitle, ds, id, 'zone')} size="sm"/>
        </Col>
        <Col>
          <h6>
            {showEditButtons}
            {editBtnsVisible ? (
              <>
                {deleteButton}
                {addButton}
                {editButton}
                {downButton}
                {upButton}
              </>
            ) : null}
          </h6>
          <div id={'component-modal'}>
            <ComponentModal open={open} setOpen={setOpen} {...z} />
          </div>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className='tol-zone'>
      {buttons}
      {currentWidgets.length > 0 ? (
        <ResponsiveWidget
          id={id}
          widgets={currentWidgets!}
          setWidgets={setCurrentWidgets}
          draggable={draggable}
          zone={z.zone}
          setZone={z.setZone}
          setDraggable={handleSetDraggable}
        />
      ) : (
        <div className="tol-zone-empty">
          {!editBtnsVisible ? (
            <p>
              Click the {"   "}
              {<FontAwesomeIcon icon={faPenToSquare} size="sm" />} to get
              started.
            </p>
          ) : (
            <p>Click the + to add a new component.</p>
          )}
        </div>
      )}
      {confirmationModal}
    </div>
  );
    
}

export default ZoneGrid;