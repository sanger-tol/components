/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef, useEffect, cloneElement } from "react";
import { WidthProvider, Responsive, Layouts } from "react-grid-layout";
import {
  generateLayout,
  IZone,
  TsDataSource,
  useBoard,
  useEffectUpdate,
  Visualisation,
  BOARDS,
  ACTIONS_DS,
  patchReorderBoardEntity,
  getWidgetOrder,
  deleteBoardEntityInParentState,
  deleteBoardEntity,
} from "../..";


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
  const [newLayout, setNewLayout] = useState(undefined);
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
      .then(() => {
        deleteBoardEntityInParentState<IZone>(componentId, zone);
        setZone({ ...zone });
      })
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
        onLayoutChange={(l: any) => setNewLayout(l)}
        onBreakpointChange={onBreakpointChange}
      >
        {zone.order.map((componentId) => {
          const component = zone.children?.[componentId];
          // TODO: Placeholder
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
                dataSource={
                  new TsDataSource({
                    dataSourceInstanceId: component.data_source_instance_id,
                    ...component.ui_api_details,
                  })
                }
                boardDataSource={boardDataSource}
                boardObjectType={BOARDS.COMPONENT}
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
