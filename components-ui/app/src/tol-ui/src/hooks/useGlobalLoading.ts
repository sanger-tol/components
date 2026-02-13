/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useContext } from "react";
import { GlobalLoadingContext, IGlobalLoadingContextValue } from "..";

export const useGlobalLoading = () => {
  const context = useContext<IGlobalLoadingContextValue>(GlobalLoadingContext);
  return context;
};