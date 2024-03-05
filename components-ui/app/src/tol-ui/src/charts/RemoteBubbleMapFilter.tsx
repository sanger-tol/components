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
  attributeKeys?: string,
  height: any,
  filterInputFields: string[]
}

function RemoteBubbleMapFilter(props: Props) {
  const { filterInputFields } = props;
  const [globalFilters, setGlobalFilters] = useState<object>({in_list: {}});

  return (
    <Container>
      <Row className="mb-4">
        <RemoteMultipleSelectFilters
          { ...props }
          fields={filterInputFields}
          globalFilters={globalFilters}
          setGlobalFilters={setGlobalFilters}
        />
      </Row>
      <Row className="mb-4">
        <RemoteBubbleMap
          { ...props }
          filter={globalFilters}
        />
      </Row>
    </Container>
  );
}

export default RemoteBubbleMapFilter;
