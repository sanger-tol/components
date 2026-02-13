/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useContext } from "react";
import { GlobalLoadingContext, IGlobalLoadingContextValue } from "..";

export const useGlobalLoading = () => {
  const context = useContext<IGlobalLoadingContextValue | undefined>(GlobalLoadingContext);

  if (context === undefined) {
    // Allows components outside the provider to safely call the hook
    return { globalLoading: true, setGlobalLoading: () => {} };
  }

  return context;
};