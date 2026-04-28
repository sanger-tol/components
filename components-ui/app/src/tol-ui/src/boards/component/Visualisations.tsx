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
  updateLayout,
  useBoard,
  useEffectUpdate,
  Visualisation,
  BOARDS,
  ACTIONS_DS,
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

  const [layoutsState, setLayouts] = useState<Layouts>();
  // newLayout is used to store the layout when the user is dragging widgets, and is emtptied once a user saves
  const [newLayout, setNewLayout] = useState(undefined);
  const internalLayouts = useRef(generateLayout(zone));

  useEffect(() => {
    const newLayout = generateLayout(zone);
    setLayouts(newLayout);
    internalLayouts.current = newLayout;
  }, [zone]);

  useEffectUpdate(() => {
    // When layout mode is turned off, we want to update the layout of the zone with the new layout
    if (!layoutMode) {
      updateLayout(
        newLayout,
        zone,
        setZone,
        boardDataSource
      );
    }
  }, [layoutMode]);

  const onBreakpointChange = () => {
    if (
      JSON.stringify(internalLayouts.current) !== JSON.stringify(layoutsState)
    ) {
      setLayouts(internalLayouts.current);
    }
  };

  return (
    <div className="tol-responsive-grid">
      <ResponsiveReactGridLayout
        layouts={layoutsState}
        breakpoints={{ lg: 992, md: 576, sm: 0 }}
        cols={{ lg: 4, md: 2, sm: 1 }}
        isDraggable={layoutMode}
        isResizable={false}
        compactType="vertical"
        rowHeight={5}
        onLayoutChange={(layout: any) => setNewLayout(layout)}
        onBreakpointChange={onBreakpointChange}
      >
        {zone.order.map((componentId) => {
          const component = zone.components[componentId];
          return cloneElement(
            <div key={component.id} className="tol-visualisation">
              <Visualisation
                id={component.id!}
                size={component.size!}
                zone={zone}
                setZone={setZone}
                componentType={component.type!}
                config={component.config}
                objectType={component.objectType!}
                dataSource={component.dataspace!}
                boardDataSource={boardDataSource}
                boardObjectType={BOARDS.COMPONENT}
                title={component.title!}
                actionsDataSource={actionsDataSource}
              />
            </div>
          )
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
}
