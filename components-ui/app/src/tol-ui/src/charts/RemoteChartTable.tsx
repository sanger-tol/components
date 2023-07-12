/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import AutoTable from "../table/AutoTable";
import RemoteBarChart from "./RemoteBarChart";
import { DateInterval } from "./ChartUtils";
import { Container, Row } from "react-bootstrap";

        
interface Props {
  stacked?: boolean,
  endpoint: string,
  baseUrl?: string,
  aggs: object,
  title: string,
  interval: DateInterval,
  setBarData: React.Dispatch<React.SetStateAction<any>>,
  tableFilter: object,
  fields?: any,
  debug?: boolean
}

function RemoteChartTable(props: Props) {
  return (
    <Container>
      <Row>
        <RemoteBarChart
          {...props}
        />
      </Row>
      <Row className="mt-5">
        <AutoTable
          {...props}
          fixedFilter={ props.tableFilter }
        />
      </Row>
    </Container>
  )
}

export default RemoteChartTable;
