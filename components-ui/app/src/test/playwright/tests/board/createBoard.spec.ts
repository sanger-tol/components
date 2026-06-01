// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { test } from '@playwright/test';
import {
  createBoard,
  createZone,
  setAuth,
  createBoardID
} from '../helpers';

const headless = !!(process.env.CI || process.env.HEADLESS);

test.use({ headless: headless });

test.beforeEach(async ({ page }) => {
  await setAuth({ page });
});

test('create dashboard', async ({ page }) => {
  const testID = createBoardID();

  await createBoard( page, testID );

  // create a view
  // await createView({page, testID});

  // create a zone
  await createZone( page, testID );
});
