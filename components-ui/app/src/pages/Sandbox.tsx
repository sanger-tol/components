/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import {
  RemoteTable,
  RemoteBarChart,
  RemoteMap,
  RemoteSunburst,
  Button,
  Filter,
  Widgets,
  Row,
  Col,
  env,
  useZone,
  resetZone
} from '../tol-ui/src';


function Sandbox() {
  return (
    <div className="bioscan-report-card">
      <Widgets
        components={components}
      />
    </div>
  );
}

export default Sandbox;
