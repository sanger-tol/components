/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useContext } from "react";
import { AppContext, IAppContextValue } from "..";

export function useApp(): IAppContextValue {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useApp must be used within an AppContextProvider.");
  }

  return context;
}
