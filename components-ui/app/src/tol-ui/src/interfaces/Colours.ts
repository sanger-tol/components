/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { COLOURS, LIGHT_COLOURS } from "..";

export type TColour = (typeof COLOURS)[keyof typeof COLOURS];
export type TLightColour = (typeof LIGHT_COLOURS)[keyof typeof LIGHT_COLOURS];
