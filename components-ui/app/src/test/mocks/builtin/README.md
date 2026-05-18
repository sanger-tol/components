<!--
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
-->

# Builtin mocks

These mocks are special, because instead of being provided to the functions to test, they outright
replace global symbols using Vitest.

For example, say `localStorage` is what needs to be mocked:
```ts
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MockLocalStorage } from "..";

describe("Example test suite", () => {
  // This can instead be done in one test specifically
  let mockLocalStorage: MockLocalStorage;
  beforeEach(() => {
    // Replace the global symbol `localStorage` with the mock
    vi.stubGlobal("localStorage", mockLocalStorage);

    // Assign to the variable so the tests can access it too
    mockLocalStorage = new MockLocalStorage();
  });

  test("localStorage is written to correctly", () => {
    functionToTest();

    const valueInLocalStorage = mockLocalStorage.getItem("key");
    expect(key).toBe("value");
  });
});
```
