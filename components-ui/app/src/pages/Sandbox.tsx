/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteTable, Widgets, env } from '../tol-ui/src';
import { useState } from 'react';

function Sandbox() {

  const table = (
    <RemoteTable id='table' endpoint='species' baseUrl={env.TOL_DATA}/>
  )

  return (
    <div >
      <Widgets
        components={[table]}
      />
    </div>
  );
}
export default Sandbox;
