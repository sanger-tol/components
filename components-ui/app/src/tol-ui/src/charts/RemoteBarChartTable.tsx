/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import AutoTable from "../table/AutoTable";
import RemoteBarChart from "./RemoteBarChart";
import { Container, Row, Button } from "react-bootstrap";

        
interface Props {
  stacked?: boolean,
  endpoint: string,
  aggs: object,
  title: string,
  barData: any,
  setBarData: React.Dispatch<React.SetStateAction<any>>|null
}

// currently under construction...
function RemoteBarChartTable(props: Props) {
  const [num, setNum] = useState("SAMEA104026389")

  return (
    <Container>
      <Row>
        <RemoteBarChart
          {...props}
        />
      </Row>
      <Button className="m-1" onClick={()=>{setNum("SAMEA104026431")}}>Change Num</Button>
      <h2>{ num }</h2>
      <Row className="mt-5">
        <AutoTable
          {...props}
          fixedFilter={{"contains": {'mlwh_accession_number': num}}}
        />
      </Row>
    </Container>
  )
}

export default RemoteBarChartTable;
