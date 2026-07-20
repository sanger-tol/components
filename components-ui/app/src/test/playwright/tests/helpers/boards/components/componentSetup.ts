// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { clickUtilityBarButton } from "../../utility-bar";
import { selectFromDropdown } from "../../components";

/**
 * Adds the specified component to the specified zone.
 * It checks whether the component was created successfully.
 * @param page The Playwright page handle
 * @param zoneIndex The zone to add this component to. Starts at 0 for the first zone in the board
 * @param component The name of the component type to add (lowercase)
 * (this will be picked from the component select modal)
 * @param size The component size to select in the component select modal
 */
export const addComponent = async (
  page: Page,
  zoneIndex: number,
  component: string,
  size: string = "Small",
) => {
  // Get how many of this component type exist already (so we can check one was added afterwards)
  const countBefore = (await page.getByTestId(`board-component-${component}`).all()).length;

  // Click the Add Component button for the desired zone
  await page.getByTestId("add-component-button").nth(zoneIndex).click();

  // Select the component type in the modal
  await page.getByTestId(`component-option-${component}`).click();

  // Select the component size in the modal
  await page.getByText(size).click();

  // Click the confirm button in the modal
  await page.getByTestId("confirm-add-component-button").click();

  // Ensure the component was added
  // I have absolutely no idea why, but if this visibility check (which should be redundant)
  // is removed, then the count retrieval afterwards does not work.
  await expect(await page.getByTestId(`board-component-${component}`)).toBeVisible();
  const countAfter = await page.getByTestId(`board-component-${component}`).count();
  await expect(countAfter).toBe(countBefore + 1);
};

/**
 * Adds a filter onto the provided component
 * Adds a filter onto the `componentIndex`th component of the `component` kind
 * @param page The Playwright page handle
 * @param component Playwright locator handle to the component to filter
 * @param componentType The type of component this is (needed to derive the testId)
 * @param attribute The attribute to apply the filter to
 * @param filterType The type of filter used on this attribute
 * @param filterValue The value to filter with
 */
export const addComponentFilter = async (
  page: Page,
  component: Locator,
  componentType: string,
  attribute: string,
  filterType: string,
  filterValue: string,
) => {
  // Click the filter button
  await clickUtilityBarButton(page, component, `${componentType}-filter-button`);

  const filterDrawer = page.locator(".tol-drawer");

  // Select the attribute to filter
  await selectFromDropdown(page, filterDrawer.getByRole("combobox").first(), [attribute]);

  // Provide the filter value
  switch (filterType) {
    case "in_list":
      await filterDrawer.getByRole("combobox").nth(1).click();
      await filterDrawer.getByText(filterValue).click();
      await filterDrawer.getByRole("combobox").nth(1).click();
  }

  // Click Apply Filter button
  await page.getByTestId("apply-filter-button").click();

  // Wait for the drawer to close
  await filterDrawer.waitFor({ state: "hidden", timeout: 5_000 });
}
