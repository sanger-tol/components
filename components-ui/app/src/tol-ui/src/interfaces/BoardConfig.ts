/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { IFieldMeta } from "./Field";

/** Board-level configuration options. */
export interface IBoardConfig {
  /** Whether users can copy the board. Defaults to true. */
  allowBoardCopy?: boolean;
  /** Whether to show the board owner's profile avatar. Defaults to true. */
  showProfileAvatar?: boolean;
  /** Board header configuration. */
  header?: {
    /** Whether to show the board header. Defaults to false. */
    visible: boolean;
    /** Optional URL for the header background image. */
    image?: string;
  };
  /** Whether to hide the board share button. Defaults to false. */
  hideShareButton?: boolean;
}

/**
 * Configuration metadata for a component.
 *
 * TODO FUTURE: config_diff to be generic.
 */
export interface IComponentConfig {
  /** Field metadata used to configure the component UI. */
  fieldMeta: Partial<IFieldMeta>;
}
