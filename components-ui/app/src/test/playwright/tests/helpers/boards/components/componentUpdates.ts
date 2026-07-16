// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator, Page } from "@playwright/test";

import { clickUtilityBarButton } from "../../utility-bar";

/**
 * Deletes the `componentIndex`th component of type `componentType` on the current board
 * @param page The Playwright page handle
 * @param component Playwright locator handle to the component to delete
 * @param componentType The name of the component type to delete
 */
export const deleteComponent = async (
  page: Page,
  component: Locator,
  componentType: string,
) => {
  // Click the delete button in the utility bar of the target component
  await clickUtilityBarButton(page, component, `delete-${componentType}-button`);

  // Click confirm in the confirmation pop-up
  await page.getByTestId("confirm-delete-button").click();
};
