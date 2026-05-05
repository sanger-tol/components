/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PButton, PIcon } from "..";

export interface ITab {
  buttons: PButton[];
  icons?: PIcon[];
}

export type TTabs = ITab[];
