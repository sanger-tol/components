/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { ButtonGroup, InfoTooltipEx } from "../tol-ui/src/general";



function Sandbox() {
  return (
    <div>
      <InfoTooltipEx
        systemName="Mac"
        sourceName="TOL"
        typeData='string'
        description="Something...."
      />
    </div>
  );
}

export default Sandbox;
