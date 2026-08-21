/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Dispatch, SetStateAction } from "react";

export interface IPageSectionNavigationItem {
  /** ID of the section element and the resulting URL hash. */
  id: string;
  /** Text displayed for the section link. */
  title: string;
}

export interface IUsePageSectionNavigationArgs {
  /** Ordered page sections to track. */
  items: IPageSectionNavigationItem[];
  /** Viewport ratio used as the active-section threshold. Defaults to one third. */
  activeOffsetRatio?: number;
}

export interface IUsePageSectionNavigationResult {
  activeId: string;
  setActiveId: Dispatch<SetStateAction<string>>;
}
