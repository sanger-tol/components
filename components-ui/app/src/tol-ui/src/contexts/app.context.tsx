/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createContext } from "react";
import type { ReactNode } from "react";
import type { TNavConfig } from "..";

export interface IAppContextValue {
  /**
   * The navigation configuration for the application.
   */
  navConfig: TNavConfig;
}

export interface IAppContextProviderProps extends IAppContextValue {
  children: ReactNode;
}

export const AppContext = createContext<IAppContextValue | undefined>(undefined);

export function AppContextProvider({
  children,
  navConfig,
}: IAppContextProviderProps) {
  return (
    <AppContext.Provider value={{ navConfig }}>
      {children}
    </AppContext.Provider>
  );
}
