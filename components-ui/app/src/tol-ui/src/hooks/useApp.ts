/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useContext } from "react";
import { AppContext, IAppContextValue } from "..";
import type { TNavConfig } from "..";

export const useApp = () => {
  const context = useContext<IAppContextValue | undefined>(AppContext);

  if (context === undefined) {
    return {
      navConfig: { data: {}, order: [] } as TNavConfig,
    };
  }

  return context;
};
