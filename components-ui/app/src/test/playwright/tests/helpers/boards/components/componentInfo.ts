// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Page } from "@playwright/test";

/**
 * Counts the number of components on the current board
 * (that fulfill the optionally provided options)
 * @param page The Playwright page handle
 * @param componentType If provided, the specific type of component to count
 * @returns The number of components found
 */
export async function getComponentCount(page: Page, componentType?: string) {
  const locator = componentType ? (
    page.getByTestId(`board-component-${componentType}`)
  ) : (
    page.locator(".tol-visualisation")
  );

  return await locator.count();
}
