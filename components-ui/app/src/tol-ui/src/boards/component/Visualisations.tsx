/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { cloneElement, useState, useRef, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";

import {
  ACTIONS_DS,
  BOARD_ENTITIES,
  deleteBoardEntity,
  generateLayout,
  getWidgetOrder,
  patchReorderBoardEntity,
  removeBoardEntityInParent,
  TsDataSource,
  useBoard,
  useEffectUpdate,
  Visualisation,
} from "../..";
import type { IZone } from "../..";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export interface PVisualisations {
  id: string;
  zone: IZone;
  setZone: (zone: IZone) => void;
  boardDataSource: TsDataSource;
  actionsDataSource?: TsDataSource;
}

export function Visualisations(props: PVisualisations) {
  const {
    zone,
    setZone,
    boardDataSource,
    actionsDataSource = ACTIONS_DS,
  } = props;

  const { layoutMode } = useBoard();

  const [layouts, setLayouts] = useState<Layouts>();
  /**
   * newLayout is used to store the layout when the user is dragging
   * widgets, and is emptied once a user saves
   */
  const [newLayout, setNewLayout] = useState<Layout[]>();
  const internalLayouts = useRef(generateLayout(zone));

  useEffect(() => {
    const newLayout = generateLayout(zone);
    setLayouts(newLayout);
    internalLayouts.current = newLayout;
  }, [zone]);

  useEffectUpdate(() => {
    /**
     * When layout mode is turned off, we want to update the layout
     * of the zone with the new layout
     */
    if (!layoutMode) onReorderComponents(getWidgetOrder(newLayout!));
  }, [layoutMode]);

  const onDeleteComponent = (componentId: string) => {
    deleteBoardEntity(boardDataSource, componentId)
      .then((status: string | void) => {
        if (status !== "success") return;
        removeBoardEntityInParent(componentId, zone);
        setZone({ ...zone });
      });
  };

  const onReorderComponents = (reorderedIds: string[]) => {
    patchReorderBoardEntity(boardDataSource, zone.id!, reorderedIds)
      .then(() => {
        zone.order = reorderedIds;
        setZone({ ...zone });
      });
  };

  const onBreakpointChange = () => {
    if (
      JSON.stringify(internalLayouts.current) !== JSON.stringify(layouts)
    ) {
      setLayouts(internalLayouts.current);
    }
  };

  return (
    <div className="tol-responsive-grid">
      <ResponsiveReactGridLayout
        layouts={layouts}
        breakpoints={{ lg: 992, md: 576, sm: 0 }}
        cols={{ lg: 4, md: 2, sm: 1 }}
        isDraggable={layoutMode}
        isResizable={false}
        compactType="vertical"
        rowHeight={5}
        onLayoutChange={(l: Layout[]) => setNewLayout(l)}
        onBreakpointChange={onBreakpointChange}
      >
        {zone.order.map((componentId) => {
          const component = zone.children?.[componentId];
          if (!component) return null;
          return cloneElement(
            <div key={component.id} className="tol-visualisation">
              <Visualisation
                id={component.id!}
                size={component.widget_type!}
                zone={zone}
                setZone={setZone}
                componentType={component.component_type!}
                config={component.config}
                objectType={component.object_type!}
                dataSource={component.dataspace!}
                boardDataSource={boardDataSource}
                boardObjectType={BOARD_ENTITIES.ENTITIES.COMPONENT}
                title={component.title!}
                actionsDataSource={actionsDataSource}
                onDeleteComponent={onDeleteComponent}
              />
            </div>,
          );
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
}
