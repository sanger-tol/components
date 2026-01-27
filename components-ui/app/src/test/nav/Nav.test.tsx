/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { expect, test, describe } from "vitest";
import { setupNavigationConfig, TNavConfig } from "../../tol-ui/src";
import { navConfigMock } from "./Nav.mock";

describe("setupNavigationConfig function", () => {
  const navWithDefaults: TNavConfig = setupNavigationConfig(navConfigMock);

  test("Function returns the new navigation config with default routes", () => {
    expect(
      navWithDefaults.data["Home"].path?.["route"]
    ).toEqual("/");
    expect(
      navWithDefaults.data["Dropdown Name 1"]["pages"].data["Page Name 1"].path?.["route"]
    ).toEqual("/page-name-1");
  });

  test("Function returns a combined navigation config that adds system defaults", () => {
    // App page route check
    expect(
      navWithDefaults.data["Home"].path?.["route"]
    ).toEqual("/");

    // System page route check - is explicitly added in the system config
    expect(
      navWithDefaults.data["Callback"].path?.["route"]
    ).toEqual("/callback");
  });
});
