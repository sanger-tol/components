/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BoardTable
} from "../../index";
import { Zone } from "../Utils";


interface Props {
  id: string;
  zone: Zone;
  setZone: any;

  objectType: string;
  baseUrl: string;
  config: any;
  title: string;
  componentType: string;
}

function Visualisation(props: Props) {
  const { componentType } = props;

  if (componentType === 'table') {
    return (
      <BoardTable {...props} />
    );
  }
  return <></>
}

export default Visualisation;
