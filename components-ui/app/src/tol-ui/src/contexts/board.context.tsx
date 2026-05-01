/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createContext, ReactNode, useState } from "react";
import { IBoard, TBoardPrivilegeOrUndefined } from "..";


export interface IBoardContextValue {
  board: IBoard;
  setBoard: (board: IBoard) => void;
  privilege: TBoardPrivilegeOrUndefined;
  setPrivilege: (privilege: TBoardPrivilegeOrUndefined) => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  layoutMode: boolean;
  setLayoutMode: (layoutMode: boolean) => void;
}

export const BoardContext = createContext<IBoardContextValue | undefined>(undefined);

export function BoardContextProvider({ children }: { children: ReactNode }) {
  const [board, setBoard] = useState<IBoard>({
    views: {},
    order: []
  });
  const [privilege, setPrivilege] = useState<TBoardPrivilegeOrUndefined>(undefined);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<boolean>(false);

  return (
    <BoardContext.Provider
      value={{
        board,
        setBoard,
        privilege,
        setPrivilege,
        editMode,
        setEditMode,
        layoutMode,
        setLayoutMode,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
