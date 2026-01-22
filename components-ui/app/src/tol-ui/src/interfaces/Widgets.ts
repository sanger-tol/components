/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IWidgetsComponent {
  component: JSX.Element;
  type: string;
}

export interface IHeight {
  /**
   * Height of the chart container, expressed as an inline CSS style (e.g. "100%")
   */
  height?: any;
}
