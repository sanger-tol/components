/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState, useRef, useEffect } from "react";
import { WidthProvider, Responsive, Layouts } from "react-grid-layout";
import {
  generateLayout,
  IZone,
  TsDataSource,
  generateVisualisations,
  updateLayout,
  useBoard,
} from "../..";


const ResponsiveReactGridLayout = WidthProvider(Responsive);

export interface PVisualisations {
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
    saveLayout,
    setSaveLayout,
    boardDataSource,
  } = props;

  const { editMode } = useBoard();
 
  const [layoutsState, setLayouts] = useState<Layouts>();
  // newLayout is used to store the layout when the user is dragging widgets, and is emtptied once a user saves
  const [newLayout, setNewLayout] = useState(undefined);
  const [elements, setElements] = useState<JSX.Element[]>([]);
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
        isDraggable={editMode}
        draggableHandle=".tol-drag-handle"
        compactType="vertical"
        rowHeight={5}
        onLayoutChange={(layout: any) => setNewLayout(layout)}
        onBreakpointChange={onBreakpointChange}
      >
        {elements.map((element) => element)}
      </ResponsiveReactGridLayout>
    </div>
  );
}
