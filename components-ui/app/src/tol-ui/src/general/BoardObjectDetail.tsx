/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BoardDataList, COMPONENT_TYPES } from "..";
import type { IListDataConfigSave, PVisualisationComponent } from "..";


/** Props for the `BoardObjectDetail` component. */
export interface PBoardObjectDetail extends PVisualisationComponent<IListDataConfigSave> { }

/** Displays x number of data objects in an object detail within a Board. */
export function BoardObjectDetail(props: PBoardObjectDetail) {
  return <BoardDataList {...props} type={COMPONENT_TYPES.OBJECT_DETAIL} />;
}
