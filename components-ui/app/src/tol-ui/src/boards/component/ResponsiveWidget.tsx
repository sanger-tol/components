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
  getWidgetOrder,
  generateLayout,
  IZone,
  ConfirmationModal,
  BOARDS,
  TsDataSource,
  API_METHODS
} from "../..";


export interface IWidgets {
  componentId: string;
  order: string; // placement in the order array
  componentZoneId: string;
  componentType: string;
  widgetType: string;
  filter: any;
  title: string;
  objectType: string;
  baseUrl: string;
  apiPrefix: string;
  config: any;
}

interface Props {
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

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export function ResponsiveWidget(props: Props) {
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
    // Generating the visualisations from the widgets
    const elementsFromWidgets = widgets.map((widget) => {
      const visualisation: JSX.Element = (
        /* @ts-ignore */
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
      );
      return (
        <div key={widget.componentId} className="tol-responsive-widget">
          {visualisation || null}
        </div>
      );
    });
    setElements(elementsFromWidgets);

    const newLayout = generateLayout(widgets);
    setLayouts(newLayout);
    internalLayouts.current = newLayout;
  }, [widgets, zone]);

  const deleteWidget = (id: string) => {
    const newWidgets = widgets.filter((widget) => widget.componentId !== id);
    boardDataSource
      .custom({
        method: API_METHODS.DELETE,
        resource: `${BOARDS.COMPONENT}/${id}`,
      })
    setWidgets(newWidgets);
  };

  useEffect(() => {
    if (saveLayout) {
      onLayoutSave(newLayout);
    }
  }, [saveLayout]);

  const onLayoutSave = async (layout) => {
    // Gets the order based off of the layout on screen
    const order = getWidgetOrder(layout);

    // Finds the highest order value in the current widgets, based off the db
    const orderValues = widgets.map((widget) => Number(widget.order));
    const highestPreviousOrder = Math.max(...orderValues);

    // Maps through the order and upserts based off of the componentId
    const payloadData = order.order.map((componentId, index) => {
      const widget = widgets.find(
        (widget) => widget.componentId === componentId,
      );
      widget!.order = highestPreviousOrder + 1 + index;
      return {
        type: BOARDS.COMPONENT_ZONE as string,
        id: widget!.componentZoneId,
        attributes: {
          order: highestPreviousOrder + index + 1,
        },
      };
    });
    await boardDataSource.upsert({
      objectType: BOARDS.COMPONENT_ZONE,
      payload: payloadData,
    });
    setSaveLayout(false);
    zone.order = order.order;
    setZone({ ...zone });
    setWidgets(widgets);
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

  // @ts-ignore
  const confirmationModal = () => (
    <ConfirmationModal
      setOpen={setConfirmationModalOpen}
      open={confirmationModalOpen}
      // @ts-ignore
      onConfirmClick={handleConfirmDeleteComponent}
      itemType="widget"
    />
  );

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
                  testid="delete-component-button"
                />
                {confirmationModal()}
              </div>
            );
          }
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
}
