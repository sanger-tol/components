/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createContext, ReactNode, useCallback, useState } from "react";
import { TBoardPrivilegeOrUndefined } from "..";


export interface IBoardContextValue {
  privilege: TBoardPrivilegeOrUndefined;
  setPrivilege: (privilege: TBoardPrivilegeOrUndefined) => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  tableLoading: boolean;
  setTableLoading: (id: string, loading: boolean) => void;
  layoutMode: boolean;
  setLayoutMode: (layoutMode: boolean) => void;
}

export const BoardContext = createContext<IBoardContextValue | undefined>(undefined);

export function BoardContextProvider({ children }: { children: ReactNode }) {
  const [privilege, setPrivilege] = useState<TBoardPrivilegeOrUndefined>(undefined);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [tableLoadingById, setTableLoadingById] = useState<Record<string, boolean>>({});
  const [layoutMode, setLayoutMode] = useState<boolean>(false);
  const tableLoading = Object.values(tableLoadingById).some(Boolean);

  const setTableLoading = useCallback((id: string, loading: boolean) => {
    setTableLoadingById((current) => {
      if (current[id] === loading) return current;
      return {
        ...current,
        [id]: loading,
      };
    });
  }, []);

  return (
    <BoardContext.Provider
      value={{
        privilege,
        setPrivilege,
        editMode,
        setEditMode,
        tableLoading,
        setTableLoading,
        layoutMode,
        setLayoutMode
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
