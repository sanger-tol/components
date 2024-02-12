/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { getCssVarValue, isPropDefined } from "./Utils";


interface Props {
  title?: string,
  description?: string,
  components: JSX.Element[],
  items: number
  cols: 4,
  rowheight: 30
}

function ResponsiveWidget(props:Props){
    const { title, description, components } = props;
}