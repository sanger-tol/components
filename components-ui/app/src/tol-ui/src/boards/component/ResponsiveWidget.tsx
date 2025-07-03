/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef, useEffect } from "react";
import { WidthProvider, Responsive, Layouts } from "react-grid-layout";
import {
  Button,
  Placeholder,
  Visualisation,
  generateLayout,
  IZone,
  ConfirmationModal,
  BOARDS,
  TsDataSource,
  IWidgets,
  onLayoutSave,
  deleteComponent,
} from "../..";


const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface PVisualisations {
  id: string;
  widgets: IWidgets[];
  draggable: boolean;
  setWidgets?: any;
  zone: IZone;
  setZone: any;
  saveLayout: boolean;
  setSaveLayout: any;
  boardDataSource: TsDataSource;
}

export function ResponsiveWidget(props: PVisualisations) {
  const {
    widgets,
    setWidgets,
    draggable,
    zone,
    setZone,
    saveLayout,
    setSaveLayout,
    boardDataSource,
  } = props;

  const [layoutsState, setLayouts] = useState<Layouts>();
  // newLayout is used to store the layout when the user is dragging widgets, and is emtptied once a user saves
  const [newLayout, setNewLayout] = useState(undefined);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [elements, setElements] = useState<JSX.Element[]>([]);
  const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null);
  const internalLayouts = useRef(generateLayout(widgets));

  useEffect(() => {
    const elementsFromWidgets = widgets.map((widget) => (
      <div key={widget.componentId} className="tol-visualisation">
        <Visualisation
          id={widget.componentId}
          size={widget.widgetType}
          zone={zone}
          setZone={setZone}
          componentType={widget.componentType}
          title={widget.title}
          config={widget.config}
          objectType={widget.objectType}
          dataSource={
            new TsDataSource({
              baseUrl: widget.baseUrl,
              apiPrefix: widget.apiPrefix,
            })
          }
          boardDataSource={boardDataSource}
          boardObjectType={BOARDS.COMPONENT}
        />
      </div>
    ));
    setElements(elementsFromWidgets);
    const newLayout = generateLayout(widgets);
    setLayouts(newLayout);
    internalLayouts.current = newLayout;
  }, [widgets, zone]);

  useEffect(() => {
    if (saveLayout) {
      onLayoutSave(
        newLayout,
        boardDataSource,
        setSaveLayout,
        widgets,
        setWidgets,
        zone,
        setZone
      );
    }
  }, [saveLayout]);

  const deleteWidget = (id: string) => {
    const newWidgets = widgets.filter((widget) => widget.componentId !== id);
    deleteComponent(id, boardDataSource);
    setWidgets(newWidgets);
  };

  const onBreakpointChange = () => {
    if (
      JSON.stringify(internalLayouts.current) !== JSON.stringify(layoutsState)
    ) {
      setLayouts(internalLayouts.current);
    }
  };

  const handleOpenModal = (key: string) => {
    setWidgetToDelete(key);
    setConfirmationModalOpen(true);
  };

  const handleConfirmDeleteComponent = () => {
    if (widgetToDelete) {
      deleteWidget(widgetToDelete);
      setWidgetToDelete(null);
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
