/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { CSSProperties, ReactNode } from "react";
import { IPagination } from "./Table";

export interface IHeight {
  /**
   * The height of this component as a React CSS value, such as "100%" or 320.
   */
  height?: CSSProperties["height"];
}

/**
 * Shared baseline props used by renderable components in this library.
 */
export interface IComponentBasics extends IHeight {
  /**
   * Unique identifier for this component instance.
   */
  id: string;
  /**
   * Optional loading state for components that fetch or prepare content.
   */
  loading?: boolean;
  /**
   * Optional custom contents to render in place of the default component body.
   */
  contents?: ReactNode;
}

/**
 * Shared baseline props used by data related components in this library that also support pagination.
 */
export interface IDataComponentBasics extends IComponentBasics, IPagination {}
