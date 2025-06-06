/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TsDataSource,
  TDataObjectListOrNull,
  TDataObjectOrNull,
  BOARDS,
} from "../..";


export async function getBoardDetails (
  boardDataSource: TsDataSource,
  userId: string,
  setErrorMessage: any
) {
  return boardDataSource
    .getListPage({
      objectType: BOARDS.BOARD,
      filter: {
        and_: {
          user_id: { eq: { value: userId } },
        },
      },
    })
    .then((data: TDataObjectListOrNull) => {
      return data?.map((board: TDataObjectOrNull) => ({
        id: board?.id,
        title: board?.title,
      }));
    })
    .catch((error: any) => {
      console.error("Error fetching boards:", error);
      setErrorMessage("Error fetching boards. Please try again later.");
    });
};
