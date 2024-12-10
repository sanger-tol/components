/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */


import { useState } from 'react';
import {
  Dashboard,
  Visualisation,
  Widgets,
  useZone,
  env
} from '../tol-ui/src';
  
  
function DashboardPage() {
  const z = useZone({
    endpoint: 'species',
    baseUrl: env.TOL_DATA,
    components: [
      {id: 'c_N281dwdg86xx'}
    ]
  });

  const table = (
    <Visualisation
      id='c_N281dwdg86xx'
      setWidgetType={() => {}}
      {...z}
    />
  )

  const components = [
    {
      component: table,
      type: 'lg'
    }
  ];

  return (
    <div className="datasource">
      <Widgets
        components={components}
      />
    </div>
  );
}

export default DashboardPage;