/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { BoardFilters, RemoteCount } from "../index";
import { saveTitle } from "../boards/utils";
import { IBoardTargetAndZone } from "../models";
import { IButton } from "../general/Button";
import { BOARDS } from '../constants';


interface Props extends IBoardTargetAndZone {
  id: string;
  title: string;
  config: any;
}

function BoardCount(props: Props) {
  const { id, boardDataSource } = props;
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
            title: props.title,
            editable: true,
            onSave: (value: string) => {
              saveTitle(value, boardDataSource, id, BOARDS.COMPONENT);
            }
          },
          buttons: [filterButton]
        }}
      />
    </>
  );
}

export default BoardCount;
