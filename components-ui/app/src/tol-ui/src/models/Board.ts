/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { HistogramGrouping } from '../charts/utils';

export interface IChartConfig {
  breakDownBy: string,
  xAxis: string,
  stacked: boolean,
  type: HistogramGrouping,
}