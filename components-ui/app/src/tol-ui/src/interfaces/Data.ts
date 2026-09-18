/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { PDataPoint } from "..";

/** Represents a generic data structure for visualisations. */
type TDataBase<T> = Record<string, T>;

/** Represents a data structure where each key maps to a ReactNode. */
export type TDataRecord = TDataBase<ReactNode>;

/** Represents a data structure where each key maps to a PDataPoint. */
export type TRemoteDataRecord = TDataBase<PDataPoint>;
