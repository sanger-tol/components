// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

export const createTable = async (
  { page },
  component: string,
  attribute: string,
) => {
      // click the slider button
      await page.getByTestId(`${component}-slider-button`).first().click();

      // click the second attribute selector dropdown
      await page.getByRole("combobox").nth(1).click();
      
      // enter the attribute
      await page.locator(".rs-search-box-input").fill(attribute);
      await page.getByText(attribute).click();
      const text = await page.locator(".tol-attribute-selector-display-key").textContent();

      // check the checkbox for the attribute
      await page.locator(`[role="checkbox"][value="${text}"]`).first().setChecked({force:true});

      // click again to hide dropdown
      await page.getByRole("combobox").nth(1).click();

      // click to save the table
      await page.getByTestId(`save-${component}-button`).click();
};