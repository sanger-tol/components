/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
;
import { BoardCount, BoardTable, BoardSunburst } from "../../index";
import { IZone } from "../utils";

interface Props {
  id: string;
  zone: IZone;
  setZone: any;

  objectType: string;
  baseUrl: string;
  config: any;
  title: string;
  componentType: string;
  size: string
}

function Visualisation(props: Props) {
  const { componentType } = props;

  switch (componentType) {
    case "table":
      return <BoardTable {...props} />;
    case "count":
      return <BoardCount {...props} />;
    case "sunburst":
      return <BoardSunburst {...props} />;
  }
}

export default Visualisation;
