/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useContext } from "react";
import { BoardContext, IBoardContextValue } from "..";


export const useBoard = () => {
  const context = useContext<IBoardContextValue | undefined>(BoardContext);

  if (context === undefined) {
    return {
      privilege: undefined,
      setPrivilege: () => {},
      editMode: false,
      setEditMode: () => {},
      layoutMode: false,
      setLayoutMode: () => {}
    };
  }

  return context;
}
