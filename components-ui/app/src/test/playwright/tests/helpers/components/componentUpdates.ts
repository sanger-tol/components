// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { Page } from "@playwright/test";
import { clickUtilityBarButton } from "../utility-bar";


export const deleteFirstComponent = async (page: Page, componentType: string) => {
  // click the delete button
  await clickUtilityBarButton({ page, testId: `delete-${componentType}-button` });

  // confirm the delete
  await page.getByTestId("confirm-delete-button").click();
};
