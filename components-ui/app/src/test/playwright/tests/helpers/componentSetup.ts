// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT


export const addComponent = async (
  {page, testID},
  component: string,
  size: string = 'Small'
) => {
  // click the add component button
  await page.getByTestId('add-component-button').first().click();

  // select the component type
  await page.getByTestId(`component-option-${component}`).click();

  // select size
  await page.getByText(size).click();

  // enter the title
  await page.getByRole('textbox').fill(testID);

  // click the add component button
  await page.getByTestId('confirm-add-component-button').click();
}

export const addComponentFilter = async (
  {page},
  component: string,
  attribute: string,
  filterValue: string,
  filterType: string
) => {
  // click the filter button
  await page.getByTestId(`${component}-filter-button`).first().click();

  switch (filterType) {
    case 'multiselect':
    // click the attribute selector dropdown
    await page.getByRole('combobox').first().click();
    
    // choose specific attribute
    await page.locator('.rs-search-box-input').fill(attribute);
    await page.getByText(attribute).click();

    // click again to hide dropdown
    await page.getByRole('combobox').first().click();


    // Give filter a value
    await page.getByRole('combobox').nth(1).click();
    await page.getByText(filterValue).click();
    await page.getByRole('combobox').nth(1).click();
  }

  // Click Apply Filter button
  await page.getByTestId('apply-filter-button').click();
}

export const deleteFirstComponent = async ({page}) => {
  // click show edit buttons button
  await page.getByTestId('edit-zone-button').first().click();

  // click the edit/move components button
  await page.getByTestId('drag-components-button').first().click();

  // click the delete button
  await page.getByTestId('delete-component-button').first().click();

  // confirm the delete
  await page.getByTestId('confirm-delete-button').click();

  // click the save button
  await page.getByTestId('save-layout-button').click();
};