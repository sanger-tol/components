/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import AutoTable from "../table/AutoTable";
import RemoteMultipleSelectFilters from "../forms/RemoteMultipleSelectFilters";
import RemoteBarChart from "./RemoteBarChart";
import { DateInterval } from "./ChartUtils";
import { Row } from "react-bootstrap";
import { useEffect, useState } from 'react';

        
interface Props {
  endpoint: string,
  aggs: object,
  title: string,
  interval: DateInterval,
  filterInputFields: string[],
  setBarData: React.Dispatch<React.SetStateAction<any>>,
  filter: object,
  fields?: any,
  debug?: boolean
  stacked?: boolean,
  baseUrl?: string
}

function RemoteChartTable(props: Props) {
  const { filterInputFields, filter } = props
  const [ globalFilters, setGlobalFilters ] = useState<object>({})
  const [ combinedFilters, setCombinedFilters ] = useState<object>(
    Object.assign({}, filter, globalFilters)
  )

  useEffect(() => {
    async function combine() {
      setCombinedFilters(Object.assign({}, filter, globalFilters))
    }
    combine()
  }, [filter])

  useEffect(() => {
    async function resetCombined() {
      setCombinedFilters(Object.assign({}, globalFilters))
    }
    resetCombined()
  }, [globalFilters])

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
