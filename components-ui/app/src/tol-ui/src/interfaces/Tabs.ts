/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { PButton, PIcon } from "..";

export interface ITab {
  buttons: PButton[];
  icons?: PIcon[];
  label?: ReactNode;
}

export type TTabs = ITab[];
