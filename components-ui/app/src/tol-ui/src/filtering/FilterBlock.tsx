/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  IRemoteTargetAndZone,
  IFilterInput,
  Filter,
  Row,
  Col
} from "..";


export interface IFilterBlock extends IRemoteTargetAndZone {
  filters: IFilterInput[];
}

export function FilterBlock(props: IFilterBlock) {
  const { filters } = props;
  return (
    <Row>
      {filters.map((filter) => (
        <Col>
          <Filter key={filter.componentId} {...filter} />
        </Col>
      ))}
    </Row>
  );
}
