/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createContext } from "react";
import { IGlobalLoadingContextValue } from "..";

export const GlobalLoadingContext = createContext<IGlobalLoadingContextValue>({
  globalLoading: false,
  setGlobalLoading() {
    throw new Error("Missing GlobalLoadingContext Provider");
  },
});

export const GlobalLoadingProvider = GlobalLoadingContext.Provider;