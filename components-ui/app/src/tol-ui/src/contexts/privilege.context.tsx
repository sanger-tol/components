/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { createContext, useState } from "react";
import { TBoardPrivilegeOrUndefined, IBoardPrivilegeContextValue } from "..";

export const PrivilegeContext = createContext<IBoardPrivilegeContextValue | undefined>(undefined);

export function BoardPrivilegeContextProvider({ children }: { children: React.ReactNode }) {
  const [privilege, setPrivilege] = useState<TBoardPrivilegeOrUndefined>(undefined);

  return <PrivilegeContext.Provider value={{ privilege, setPrivilege }}>{children}</PrivilegeContext.Provider>
}
