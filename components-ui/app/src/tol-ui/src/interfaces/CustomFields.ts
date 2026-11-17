/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IRuntimeFieldFunctionParam {
  pythonType: string;
  defaultValue?: any;
}

export interface IRuntimeFieldFunction {
  id: number;
  name: string;
  params: Record<string, IRuntimeFieldFunctionParam>;
  description?: string;
}
