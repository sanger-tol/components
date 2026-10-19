/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardDataList, COMPONENT_TYPES } from "..";
import type { IListDataConfigSave, PVisualisationComponent } from "..";


/** Props for the `BoardTimeline` component. */
export interface PBoardTimeline extends PVisualisationComponent<IListDataConfigSave> { }

/** Displays x number of data objects in a timeline within a Board. */
export function BoardTimeline(props: PBoardTimeline) {
  return <BoardDataList {...props} type={COMPONENT_TYPES.TIMELINE} />;
}
