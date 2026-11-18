/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createContext } from "react";
import type { IFormOptions } from "../interfaces/forms/Forms";

export interface IFormOptionsContext extends IFormOptions {
  sectionLocked?: boolean;
  requiredAsText?: boolean;
  inlineLabels?: boolean;
}

export const FormOptionsContext = createContext<IFormOptionsContext>({});