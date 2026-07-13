// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { Page } from "@playwright/test";
import { clickUtilityBarButton } from "../../utility-bar";

/**
 * Deletes the `componentIndex`th component of type `componentType` on the current board
 * @param page The Playwright page handle
 * @param componentType The name of the component type to delete
 * @param componentIndex Out of all components of this type, which one is it? Zero-indexed
 */
export const deleteComponent = async (
  page: Page,
  componentType: string,
  componentIndex: number,
) => {
  // Click the delete button in the utility bar of the target component
  await clickUtilityBarButton(page, `delete-${componentType}-button`, componentIndex);

  // Click confirm in the confirmation pop-up
  await page.getByTestId("confirm-delete-button").click();
};
