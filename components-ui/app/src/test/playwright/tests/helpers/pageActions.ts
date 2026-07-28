// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import type { Locator } from "@playwright/test";

import { sleep } from "./sleep";

/**
 * Clicks the provided element a few times in case it's a bit flaky in the DOM
 * @param getLocator Function returning the locator of the element to click
 * @param attempts How many times to try clicking before giving up
 * @param timeoutMs The value in miliseconds to use for all timeouts in this helper
 */
export const clickWithRetries = async (
  getLocator: () => Locator,
  attempts: number = 5,
  timeoutMs: number = 1_500,
) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const locator = getLocator();
      await locator.waitFor({ state: "visible", timeout: timeoutMs });
      await locator.click({ timeout: timeoutMs });

      // If no error has been thrown by this point then the click was successful
      return;
    } catch (error) {
      lastError = error;
      await sleep(100 * (attempt + 1));
    }
  }

  // If none of the click attempts worked, throw the error
  throw lastError;
};
