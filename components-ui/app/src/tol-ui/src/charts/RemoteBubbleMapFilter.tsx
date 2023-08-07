/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import RemoteBubbleMap from "./RemoteBubbleMap";
import RemoteMultipleSelectFilters from "../forms/RemoteMultipleSelectFilters";
import { Container, Row } from 'react-bootstrap';


interface Props {
  endpoint: string,
  baseUrl?: string,
  longitudeKey: string,
  latitudeKey: string,
  height: number,
  filterInputFields: string[]
}

function RemoteBubbleMapFilter(props: Props) {
  const { endpoint, baseUrl, longitudeKey, latitudeKey, height, filterInputFields } = props;
  const [globalFilters, setGlobalFilters] = useState<object>({})

  return (
    <Container>
    <Row className="mb-4">
      <RemoteMultipleSelectFilters
        endpoint={endpoint}
        fields={filterInputFields}
        globalFilters={globalFilters}
        setGlobalFilters={setGlobalFilters}
      />
    </Row>
    <Row className="mb-4">
      <RemoteBubbleMap
        endpoint={endpoint}
        baseUrl={baseUrl}
        longitudeKey={longitudeKey}
        latitudeKey={latitudeKey}
        height={height}
        filter={globalFilters}
      />
    </Row>
    </Container>
  )
}

export default RemoteBubbleMapFilter;
