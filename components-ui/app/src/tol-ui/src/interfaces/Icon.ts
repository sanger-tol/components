/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


/**
 * Metadata inferred from a known external provider URL.
 *
 * These values are used to determine which icon and label should be displayed
 * when the provider is recognised from a link target.
 */
export interface IDetectedLinkDetails {
  /** Detected icon name from the URL. */
  icon?: string;
  /** Detected text label from the URL. */
  text?: string;
  /** Detected FontAwesome icon configuration, such as "solid", "regular", or "brands". */
  config?: string;
}

/**
 * Definition for a known external provider icon.
 *
 * The provider metadata is used to both render the correct icon and provide a
 * user-facing label when the icon is displayed in a link or social list.
 */
export interface IIconProvider {
  /** Icon name (FontAwesome). */
  icon: string;
  /** Text label for the provider. */
  text: string;
  /** FontAwesome icon configuration, such as "solid", "regular", or "brands". */
  config?: string;
}
