/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
;
import { BoardCount, BoardTable } from "../../index";
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
}

function Visualisation(props: Props) {
  const { componentType } = props;

  if (componentType === "table") {
    return <BoardTable {...props} />;
  } else if (componentType === "count") {
    return <BoardCount {...props}/>;
  }
  return <></>;
}

export default Visualisation;
