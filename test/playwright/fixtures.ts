// SPDX-FileCopyrightText: 2025 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { test as base } from '@playwright/test';

export const test = base.extend({
  token: async ({}, use) => {
    const token = process.env.PLAYWRIGHT_TOKEN;
    await use(token);
  },
});
