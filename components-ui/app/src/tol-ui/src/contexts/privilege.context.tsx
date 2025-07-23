/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { createContext, useState } from "react";
import { TBoardPrivilegeOrUndefined } from "..";

export interface BoardPrivilegeContextValue {
  privilege: TBoardPrivilegeOrUndefined;
  setPrivilege: (privilege: TBoardPrivilegeOrUndefined) => void;
}

export const PrivilegeContext = createContext<BoardPrivilegeContextValue | undefined>(undefined);

export function BoardPrivilegeContextProvider({ children }: { children: React.ReactNode }) {
  const [privilege, setPrivilege] = useState<TBoardPrivilegeOrUndefined>('viewable');
  
  return <PrivilegeContext.Provider value={{ privilege, setPrivilege }}>{children}</PrivilegeContext.Provider>
}
