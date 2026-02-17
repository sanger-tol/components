/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createContext, ReactNode, useState } from "react";
import { TBoardPrivilegeOrUndefined } from "..";


export interface IBoardContextValue {
  privilege: TBoardPrivilegeOrUndefined;
  setPrivilege: (privilege: TBoardPrivilegeOrUndefined) => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
}

export const BoardContext = createContext<IBoardContextValue | undefined>(undefined);

export function BoardContextProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState<boolean>(true);
  const [privilege, setPrivilege] = useState<TBoardPrivilegeOrUndefined>(undefined);

  return (
    <BoardContext.Provider value={{ privilege, setPrivilege, editMode, setEditMode }}>
      {children}
    </BoardContext.Provider>
  );
}
