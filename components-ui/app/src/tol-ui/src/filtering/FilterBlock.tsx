/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
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
  contents?: ReactNode;
}

export function FilterBlock(props: PFilterBlock) {
  const { filters, utilityBarConfig, contents } = props;
  return (
    <>
      <UtilityBar {...utilityBarConfig} />
      {contents ? contents : <>
        <Row>
          {filters.order.map((filter) => (
            <Col key={filters.attributes[filter].attribute} className="tol-block-filter-col">
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
      </>}
    </>
  );
}
