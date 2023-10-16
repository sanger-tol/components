/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import RemoteTable from "../table/RemoteTable";
import RemoteMultipleSelectFilters from "../forms/RemoteMultipleSelectFilters";
import RemoteBarChart from "./RemoteBarChart";
import { DateInterval } from "./ChartUtils";
import { Row } from "react-bootstrap";
import { useState } from 'react';

        
interface Props {
  id: string,
  title: string,
  endpoint: string,
  breakDownBy: string,
  xAxis: string,
  interval: DateInterval,

  // config
  stacked?: boolean,
  baseUrl?: string

  // global filters
  filterInputFields: string[]

  // table
  fields?: any,
  debug?: boolean
}

function RemoteChartTable(props: Props) {
  const { filterInputFields } = props
  const [ globalFilters, setGlobalFilters ] = useState<object>({})
  const [ combinedFilters, setCombinedFilters ] = useState<object>({})

  return (
    <div>
      <Row className="mb-4">
        <RemoteMultipleSelectFilters
          {...props}
          fields={filterInputFields}
          globalFilters={globalFilters}
          setGlobalFilters={setGlobalFilters}
        />
      </Row>
      <Row className="mb-4">
        <RemoteBarChart
          {...props}
          filter={globalFilters}
          setCombinedFilters={setCombinedFilters}
          type='date'
          height={500}
        />
      </Row>
      <Row>
        <RemoteTable
          {...props}
          filter={combinedFilters}
        />
      </Row>
    </div>
  )
}

export default RemoteChartTable;
