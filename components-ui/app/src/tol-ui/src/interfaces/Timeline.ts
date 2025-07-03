/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export type TIcon = "active-dot" | "dot";

export interface ITimelineItem {
  title?: string;
  date?: Date;
  color?: string;
  icon?: TIcon | React.ReactNode;
  desc?: string;
}

export interface ITimelineData {
  [key: string]: ITimelineItem;
}
