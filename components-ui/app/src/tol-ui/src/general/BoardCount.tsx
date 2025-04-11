/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { BoardFilters, RemoteCount } from "../index";
import { IZone } from "../boards/utils";
import { IButton } from "../general/Button";

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

  const filterButton: IButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    className: "count-filter-button",
  }

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
        endpoint={objectType}
        baseUrl={props.baseUrl}
        zone={props.zone}
        setZone={props.setZone}
        utilityBarConfig={{
          title: {title: props.title},
          buttons: [filterButton]
        }}
      />
    </div>
  );
}

export default BoardCount;
