/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  IRemoteTargetAndZone,
  Filter,
  Row,
  Col,
  PUtilityBar,
  UtilityBar,
  IFilterBlockFilters
} from "..";


export interface PFilterBlock extends IRemoteTargetAndZone {
  filters: IFilterBlockFilters;
  utilityBarConfig?: PUtilityBar;
}

export function FilterBlock(props: PFilterBlock) {
  const { filters, utilityBarConfig } = props;
  return (
    <>
      <UtilityBar {...utilityBarConfig} />
      <Row>
        {filters.order.map((filter) => (
          <Col key={filters.attributes[filter].attribute}>
            <Filter
              objectType={props.objectType}
              dataSource={props.dataSource}
              zone={props.zone}
              setZone={props.setZone}
              {...filters.attributes[filter]}
            />
          </Col>
        ))}
      </Row>
    </>
  );
}
