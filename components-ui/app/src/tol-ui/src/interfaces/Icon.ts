/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IDetectedLinkDetails {
  /**  Detected icon name from the URL. */
  icon?: string;
  /** Detected text label from the URL. */
  text?: string;
  /** Detected FontAwesome icon configuration, such as "solid", "regular", or "brands". */
  config?: string;
}

export interface IIconProvider {
  /** Icon name (FontAwesome) */
  icon: string;
  /** Text label */
  text: string;
  /** FontAwesome icon configuration, such as "solid", "regular", or "brands". */
  config?: string;
}
