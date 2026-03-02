/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IGlobalLoadingContextValue {
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
};
