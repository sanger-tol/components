/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { DateInterval } from "./ChartUtils";
import { Container, Row } from "react-bootstrap";
import { useEffect, useState } from 'react';
import { RemoteChartTable, RemoteMultipleSelectFilters } from "../index";

        
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
  barClickFilters: object,
  filterInputFields: string[],
}

function RemoteChartTableFilter(props: Props) {
  const { filterInputFields, barClickFilters } = props
  const [ globalFilters, setGlobalFilters ] = useState<object>({})
  const [ combinedFilters, setCombinedFilters ] = useState<object>(
    Object.assign({}, barClickFilters, globalFilters)
  )

  useEffect(() => {
    async function combine() {
      console.log('ChartTableFilter combine')
      setCombinedFilters(Object.assign({}, barClickFilters, globalFilters))
    }
    combine()
  }, [barClickFilters])

  useEffect(() => {
    async function resetCombined() {
      setCombinedFilters(Object.assign({}, globalFilters))
    }
    resetCombined()
  }, [globalFilters])

  return (
    <Container>
      <Row className="mb-4">
        <RemoteMultipleSelectFilters
          {...props}
          fields={filterInputFields}
          globalFilters={globalFilters}
          setGlobalFilters={setGlobalFilters}
        />
      </Row>
      <RemoteChartTable
        {...props}
        globalFilters={globalFilters}
        combinedFilters={combinedFilters}
      />
    </Container>
  )
}

export default RemoteChartTableFilter;
