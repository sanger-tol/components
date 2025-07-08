/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef, useEffect } from "react";
import { WidthProvider, Responsive, Layouts } from "react-grid-layout";
import {
  Button,
  Placeholder,
  generateLayout,
  IZone,
  ConfirmationModal,
  TsDataSource,
  generateVisualisations,
  updateLayout,
  BOARDS,
  removeComponent,
} from "../..";


const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface PVisualisations {
  id: string;
  zone: IZone;
  setZone: (zone: IZone) => void;
  draggable: boolean;
  saveLayout: boolean;
  setSaveLayout: any;
  boardDataSource: TsDataSource;
}

export function Visualisations(props: PVisualisations) {
  const {
    zone,
    setZone,
    draggable,
    saveLayout,
    setSaveLayout,
    boardDataSource,
  } = props;

  const [layoutsState, setLayouts] = useState<Layouts>();
  // newLayout is used to store the layout when the user is dragging widgets, and is emtptied once a user saves
  const [newLayout, setNewLayout] = useState(undefined);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [elements, setElements] = useState<JSX.Element[]>([]);
  const [componentToDelete, setComponentToDelete] = useState<string | null>(null);
  const internalLayouts = useRef(generateLayout(zone));

  useEffect(() => {
    setElements(
      generateVisualisations(
        zone,
        setZone,
        boardDataSource
      )
    );
    const newLayout = generateLayout(zone);
    setLayouts(newLayout);
    internalLayouts.current = newLayout;
  }, [zone]);

  useEffect(() => {
    if (saveLayout) {
      updateLayout(
        newLayout,
        setSaveLayout,
        zone,
        setZone,
        boardDataSource
      );
    }
  }, [saveLayout]);

  const deleteComponent = (id: string) => {
    boardDataSource
      .deleteByID({
        objectType: BOARDS.COMPONENT,
        id: id,
      })
    removeComponent(id, zone);
    setZone({ ...zone });
  };

  const onBreakpointChange = () => {
    if (
      JSON.stringify(internalLayouts.current) !== JSON.stringify(layoutsState)
    ) {
      setLayouts(internalLayouts.current);
    }
  };

  const handleOpenModal = (key: string) => {
    setComponentToDelete(key);
    setConfirmationModalOpen(true);
  };

  const handleConfirmDeleteComponent = () => {
    if (componentToDelete) {
      deleteComponent(componentToDelete);
      setComponentToDelete(null);
    }
    setConfirmationModalOpen(false);
  };

  return (
    <div className="tol-responsive-grid">
      <ResponsiveReactGridLayout
        layouts={layoutsState}
        breakpoints={{ lg: 992, md: 576, sm: 0 }}
        cols={{ lg: 4, md: 2, sm: 1 }}
        isDraggable={draggable}
        compactType="vertical"
        rowHeight={150}
        onLayoutChange={(layout: any) => setNewLayout(layout)}
        onBreakpointChange={onBreakpointChange}
        draggableCancel=".widget-delete-btn"
      >
        {elements.map((element) => {
          // Check if there is a component that matches the ids
          if (!draggable) {
            return element;
          } else {
            return (
              <div
                className="tol-draggable-widget"
                key={element.props.children.props.id}
              >
                <Placeholder message={element.props.children.props.title} />
                <Button
                  onClick={() => {
                    handleOpenModal(element.props.children.props.id);
                  }}
                  type="error"
                  className="widget-delete-btn"
                  icon="trash"
                  testid="delete-component-button"
                />
                <ConfirmationModal
                  setOpen={setConfirmationModalOpen}
                  open={confirmationModalOpen}
                  // @ts-ignore
                  onConfirmClick={handleConfirmDeleteComponent}
                  itemType="widget"
                />
              </div>
            );
          }
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
}
