/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Tabs } from "../..";


export interface PViewSelector {

}

export function ViewSelector(props: PViewSelector) {
  const [activeTab, setActiveTab] = useState();

  return (
    <Tabs>

    </Tabs>
  )
}