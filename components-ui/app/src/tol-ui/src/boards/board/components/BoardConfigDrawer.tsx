/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { Dispatch, SetStateAction } from "react";
import { Drawer } from "../../..";

export interface PBoardConfigDrawer {
  /** Whether the configuration drawer is open. */
  open: boolean;
  /** Updates whether the configuration drawer is open. */
  setOpen: Dispatch<SetStateAction<boolean>>;
}

/** Renders the currently empty board configuration drawer. */
export function BoardConfigDrawer(props: PBoardConfigDrawer) {
  const { open, setOpen } = props;

  return <Drawer open={open} setOpen={setOpen} title="Board Options" />;
}
