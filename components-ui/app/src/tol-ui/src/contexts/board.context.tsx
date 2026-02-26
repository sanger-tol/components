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
  layoutMode: boolean;
  setLayoutMode: (layoutMode: boolean) => void;
}

export const BoardContext = createContext<IBoardContextValue | undefined>(undefined);

export function BoardContextProvider({ children }: { children: ReactNode }) {
  const [privilege, setPrivilege] = useState<TBoardPrivilegeOrUndefined>(undefined);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<boolean>(false);

  return (
    <BoardContext.Provider
      value={{
        privilege,
        setPrivilege,
        editMode,
        setEditMode,
        layoutMode,
        setLayoutMode
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
