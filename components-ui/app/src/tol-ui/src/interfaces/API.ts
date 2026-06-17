/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { API_METHODS } from "..";

export type TApiMethod = (typeof API_METHODS)[keyof typeof API_METHODS];
