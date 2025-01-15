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
  InlineEdit,
  BoardFilters
} from '../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPlus,
  faArrowUp,
  faArrowDown,
  faPenToSquare,
  faCheck,
  faFilter,
  faUpDownLeftRight,
  faFloppyDisk
} from '@fortawesome/free-solid-svg-icons';
import {
  getComponents,
  saveTitle
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
  title: string,
  objectType: string,
  onZoneReorder: any,
  deleteZone: any,
  ds: any
}

function ZoneGrid(props: Props) {
  const { id, objectType, onZoneReorder, deleteZone, ds } = props;
  const [draggable, setDraggable] = useState(false);
  const [currentWidgets, setCurrentWidgets] = useState<Widgets[]>([]);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [editBtnsVisible, setEditBtnsVisible] = useState(false);
  const [saveLayout, setSaveLayout] = useState(false);
  const z = useZone({
    endpoint: objectType,
    baseUrl: env.TOL_DATA,
    components: []
  });

  const handleOpenModal = () => {
    setConfirmationModalOpen(true);
  };

  const handleBtnsVisible = () => {
    setEditBtnsVisible(!editBtnsVisible);
  };

  const confirmationModal = (
    <ConfirmationModal
      setOpen={setConfirmationModalOpen}
      open={confirmationModalOpen}
      onConfirmClick={() => deleteZone(id)}
      itemType={"zone"}
    />
  );

  useEffect(() => {
    getComponents(id).then((res: any) => {
    // Sort the widgets based on the order value
    const sortedWidgets = res.sort((a, b) => a.order - b.order);
      setCurrentWidgets(res);
      sortedWidgets.forEach((widget) => {
        z.zone.components[widget.componentId] = {
          data: {
            defaultFilter: {and_: {}},
            filter: {and_: {}},
            id: widget.componentId,
            order: widget.order,
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
      className='edit-config-button'
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
      className='edit-config-button'
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
      className='edit-config-button'
    >
      <FontAwesomeIcon icon={faArrowUp} size="sm" />
    </Button>
  );
  
  const downButton = (
    <Button
      onClick={async () => {
        await onZoneReorder(id, 'down');
      }}
      className='edit-config-button'
    >
      <FontAwesomeIcon icon={faArrowDown} size="sm" />
    </Button>
  );

  const saveButton = (
    <Button
      onClick={() => {
        setDraggable(!draggable);
        setSaveLayout(true);
        setDraggable(false)
      }}
      className='edit-config-button'
      variant="success"
    >
      <FontAwesomeIcon icon={faFloppyDisk} size="sm" />
    </Button>
  );

  const filtersButton = (
    <Button
      onClick={() => setOpenFilters(true)}
      className='edit-config-button'
      disabled
    >
      <FontAwesomeIcon icon={faFilter} size="sm" />
    </Button>
  );

  const showEditButtons = (
    <Button
      onClick={() => {
        handleBtnsVisible();
      }}
      variant="primary"
      className="edit-config-button"
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
          <InlineEdit title={props.title} onSave={(newTitle) => saveTitle(newTitle, ds, id, 'zone')} />
        </Col>
        <Col>
          <h6>
          {!draggable ? (
            <>
            {showEditButtons}
            {editBtnsVisible ? (
              <>
                {deleteButton}
                {addButton}
                {editButton}
                {downButton}
                {upButton}
                {filtersButton}
              </>
            ) : null}
            </>
          ) : 
            <>
              {saveButton}
            </>
          }
          </h6>
          <div id={'component-modal'}>
            <ComponentModal 
              open={open}
              setOpen={setOpen}
              zoneId={id}
              ds={ds}
              currentWidgets={currentWidgets}
              setCurrentWidgets={setCurrentWidgets}
              {...z}
            />
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
          saveLayout={saveLayout}
          setSaveLayout={setSaveLayout}
          ds={ds}
        />
      ) : (
        <div className="tol-zone-empty">
          {editBtnsVisible ?
            <p>
              Click the
              <FontAwesomeIcon
                icon={faPlus}
                size="lg"
                style={{padding: "0 8"}}
              />
              to add a new Component to the Zone.
            </p>
          :
            <p>
              Click the
              <FontAwesomeIcon
                icon={faPenToSquare}
                size="lg"
                style={{padding: "0 8"}}
              />
              to start editing the Zone.
            </p>
          }
        </div>
      )}
      {confirmationModal}
      <BoardFilters
        entityType="zone"
        open={openFilters}
        setOpen={setOpenFilters}
        {...z}
      />
    </div>
  );
    
}

export default ZoneGrid;