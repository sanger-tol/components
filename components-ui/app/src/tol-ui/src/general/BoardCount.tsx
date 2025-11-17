/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  BoardFilters,
  RemoteCount,
  saveTitle,
  PButton,
  useBoardPrivilege,
  PRIVILEGE,
  PVisualisation,
} from "..";

export interface PBoardCount extends PVisualisation {
  config: any;
}

export function BoardCount(props: PBoardCount) {
  const { id, utilityBarConfig, boardObjectType, boardDataSource } = props;
  const [openFilters, setOpenFilters] = useState(false);
  const { privilege } = useBoardPrivilege();

  const filterButton: PButton = {
    outline: true,
    position: "right",
    type: "primary",
    onClick: () => setOpenFilters(true),
    icon: "filter",
    className: "count-filter-button",
    testid: "count-filter-button",
    visible: privilege === PRIVILEGE.BOARD.EDITABLE,
  };

  return (
    <>
      <BoardFilters {...props} open={openFilters} setOpen={setOpenFilters} />
      <RemoteCount
        {...props}
        utilityBarConfig={{
          title: {
            text: utilityBarConfig.title?.text,
            editable: privilege === PRIVILEGE.BOARD.EDITABLE,
            onSave: (value: string) => {
              saveTitle(value, id, boardObjectType, boardDataSource);
            },
          },
          buttons: [filterButton],
          ...utilityBarConfig,
        }}
      />
    </>
  );
}
