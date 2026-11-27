/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createContext } from "react";
import type { ReactNode } from "react";
import type { TNavConfig } from "..";

export interface IAppContextValue {
  /** Application ID used for the web_app configuration. */
  id: string;
  /** The navigation configuration for the application. */
  navConfig: TNavConfig;
}

export interface IAppContextProviderProps extends IAppContextValue {
  children: ReactNode;
}

export const AppContext = createContext<IAppContextValue | undefined>(undefined);

export function AppContextProvider({
  children,
  id,
  navConfig,
}: IAppContextProviderProps) {
  return (
    <AppContext.Provider value={{ id, navConfig }}>
      {children}
    </AppContext.Provider>
  );
}
