/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import {
  BoardFilters,
  RemoteCount,
  saveTitle,
  IBoardTargetAndZone,
  IButton,
} from "..";


interface Props extends IBoardTargetAndZone {
  id: string;
  title: string;
  config: any;
}

export function BoardCount(props: Props) {
  const { id, boardObjectType, boardDataSource } = props;
  const [openFilters, setOpenFilters] = useState(false);

  const filterButton: IButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    className: "count-filter-button",
    testid: "count-filter-button",
  }

  return (
    <>
      <BoardFilters
        {...props}
        open={openFilters}
        setOpen={setOpenFilters}
      />
      <RemoteCount
        {...props}
        utilityBarConfig={{
          title: {
            text: props.title,
            editable: true,
            onSave: (value: string) => {
              saveTitle(value, id, boardObjectType, boardDataSource);
            }
          },
          buttons: [filterButton]
        }}
      />
    </>
  );
}
