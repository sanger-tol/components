/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
;
import {
  BoardCount,
  BoardTable,
  BoardSunburst,
  BoardChart
} from "../../index";
import { IBoardTargetAndZone } from "../../models";

interface Props extends IBoardTargetAndZone {
  id: string;
  config: any;
  title: string;
  componentType: string;
  size: string
}

export function Visualisation(props: Props) {
  const { componentType } = props;

  switch (componentType) {
    case "table":
      return <BoardTable {...props} />;
    case "count":
      return <BoardCount {...props} />;
    case "sunburst":
      return <BoardSunburst {...props} />;
    case "chart":
      return <BoardChart {...props} />;
  }
}
