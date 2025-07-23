/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useContext } from "react";
import {
  BoardCount,
  BoardTable,
  BoardSunburst,
  BoardChart,
  IBoardTargetAndZone,
  BoardMarkdown,
  PrivilegeContext
} from "../..";


export interface PVisualisation extends IBoardTargetAndZone {
  id: string;
  config: any;
  title: string;
  componentType: string;
  size: string
}

export function Visualisation(props: PVisualisation) {
  const { componentType } = props;
  const privilege = useContext(PrivilegeContext);
  const editable = privilege === "editable";

  switch (componentType) {
    case "table":
      return <BoardTable {...props} editable={editable}/>;
    case "count":
      return <BoardCount {...props} editable={editable}/>;
    case "sunburst":
      return <BoardSunburst {...props} editable={editable}/>;
    case "chart":
      return <BoardChart {...props} editable={editable}/>;
    case "text":
      return <BoardMarkdown {...props} editable={editable}/>;
  }
}
