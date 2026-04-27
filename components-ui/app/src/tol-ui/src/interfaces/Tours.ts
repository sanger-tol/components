/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface ITourStep {
  /**
   * `testid` is used for Playwright tests. To not duplicate attributes, we re-use it for tours
   */
  testid: string,
  /**
   * The title shown in the pop-up
   */
  title: string,
  /**
   * The description shown in the pop-up
   */
  description: string,
};
