// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { expect, Page } from "@playwright/test";
import { clickUtilityBarButton } from "../utility-bar";

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
 * Adds a filter onto the `componentIndex`th component of the `component` kind
 * @param page The Playwright page handle
 * @param component The name of the component type
 * @param componentIndex Out of all components of the `component` type on the screen,
 * which one is it? Zero-indexed
 * @param attribute The attribute to apply the filter to
 * @param filterType The type of filter used on this attribute
 * @param filterValue The value to filter with
 */
export const addComponentFilter = async (
  page: Page,
  component: string,
  componentIndex: number,
  attribute: string,
  filterType: string,
  filterValue: string,
) => {
  // click the filter button
  await clickUtilityBarButton(page, `${component}-filter-button`, componentIndex);

  switch (filterType) {
    case "in_list":
      // click the attribute selector dropdown
      await page.getByRole("combobox").first().click();

      // choose specific attribute
      await page.locator(".rs-search-box-input").fill(attribute);
      await page.getByText(attribute).click();

      // click again to hide dropdown
      await page.getByRole("combobox").first().click();


      // Give filter a value
      await page.getByRole("combobox").nth(1).click();
      await page.getByText(filterValue).click();
      await page.getByRole("combobox").nth(1).click();
  }

  // Click Apply Filter button
  await page.getByTestId("apply-filter-button").click();
}
