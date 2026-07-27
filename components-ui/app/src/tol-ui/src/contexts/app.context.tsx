/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createContext, ReactNode } from "react";
import { TNavConfig } from "..";

export interface IAppContextValue {
  /**
   * The navigation configuration for the application.
   */
  navConfig: TNavConfig;
}

export const AppContext = createContext<IAppContextValue | undefined>(undefined);

export function AppContextProvider({
  children,
  navConfig,
}: {
  children: ReactNode;
  navConfig: TNavConfig;
}) {
  return (
    <AppContext.Provider value={{ navConfig }}>
      {children}
    </AppContext.Provider>
  );
}
