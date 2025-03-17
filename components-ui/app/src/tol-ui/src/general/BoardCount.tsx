/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { BoardFilters, Button, RemoteCount } from "../index";
import { IZone } from "../boards/utils";

interface Props {
  id: string;
  title: string;
  objectType: string;
  baseUrl?: string;
  zone: IZone;
  setZone: any;
  config: any;
}

function BoardCount(props: Props) {
  const { id, objectType } = props;
  const [openFilters, setOpenFilters] = useState(false);

  const filterButtons = [
    <Button
      outline
      position="right"
      type="primary"
      onClick={() => setOpenFilters(true)}
      icon="filter"
      className="count-filter-button"
    />
  ];

  return (
    <div style={{height: "100%"}}>
      <BoardFilters
        endpoint={objectType}
        entityType="component"
        open={openFilters}
        setOpen={setOpenFilters}
        {...props}
      />
      <RemoteCount
        id={id}
        title={props.title}
        buttons={filterButtons}
        endpoint={objectType}
        baseUrl={props.baseUrl}
        zone={props.zone}
        setZone={props.setZone}
      />
    </div>
  );
}

export default BoardCount;
