/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import AutoTable from "../table/AutoTable";
import RemoteBarChart from "./RemoteBarChart";
import { DateInterval } from "./ChartUtils";
import { Row } from "react-bootstrap";
import { useEffect, useState } from 'react';

        
interface Props {
  endpoint: string,
  baseUrl?: string

  // chart specific 
  aggs: object,
  title: string,
  stacked?: boolean,
  interval: DateInterval,
  setBarData: React.Dispatch<React.SetStateAction<any>>,

  // table specific
  fields?: any,
  debug?: boolean,

  // filtering
  globalFilters: object,
  combinedFilters: object
}

function RemoteChartTable(props: Props) {
  const { globalFilters, combinedFilters } = props

  return (
    <div>
      <Row className="mb-4">
        <RemoteBarChart
          {...props}
          filter={globalFilters}
          height={700}
        />
      </Row>
      <Row>
        <AutoTable
          {...props}
          fixedFilter={combinedFilters}
        />
      </Row>
    </div>
  )
}

export default RemoteChartTable;
