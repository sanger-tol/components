/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { expect, test, describe } from "vitest";
import { setupNavigationConfig, TNavConfig, collectNavigationItems } from "../../tol-ui/src";
import { findDropdownByTitle, findLinkByText, navConfigMock } from "..";
import { testUser } from "../mocks/user.mock";


const navWithDefaults: TNavConfig = setupNavigationConfig(navConfigMock);

describe("setupNavigationConfig function", () => {
  test("Function returns the new navigation config with default routes", () => {
    expect(navWithDefaults.data["Home"].path?.["route"]).toEqual("/");
    expect(
      navWithDefaults.data["Dropdown Name 1"]["pages"].data["Page Name 1"].path?.["route"]
    ).toEqual("/page-name-1");
  });

  test("Function returns a combined navigation config that adds system defaults", () => {
    // App page route check
    expect(navWithDefaults.data["Home"].path?.["route"]).toEqual("/");

    // System page route check - is explicitly added in the system config
    expect(navWithDefaults.data["Callback"].path?.["route"]).toEqual("/callback");
  });
});

describe("collectNavigationItems function", () => {
  const navItems = collectNavigationItems(navWithDefaults, null);
  const emptyNavItems = collectNavigationItems(undefined, null);

  test("returns empty array when navigation is undefined", () => {
    expect(emptyNavItems).toEqual([]);
  });

  test("collects top-level links (e.g. Home) with correct href", () => {
    const home = findLinkByText(navItems, "Home");
    expect(home).toBeTruthy();
    expect(home?.props?.href).toBe("/");
  });

  test("collects dropdowns and recursively collects child links", () => {
    const dropdown = findDropdownByTitle(navItems, "Dropdown Name 1");
    expect(dropdown).toBeTruthy();

    const dropdownChildren = React.Children.toArray(dropdown!.props.children);
    const page1 = findLinkByText(dropdownChildren, "Page Name 1");

    expect(page1).toBeTruthy();
    expect(page1?.props?.href).toBe("/page-name-1");
  });
});

describe("test navigation access control", () => {
  test("collectNavigationItems respects access control for public pages", () => {
    const navItems = collectNavigationItems(navWithDefaults, null);
    const home = findLinkByText(navItems, "Home");
    expect(home).toBeTruthy();
  });

  test("collectNavigationItems respects access control for public pages as a logged in user", () => {
    const navItems = collectNavigationItems(navWithDefaults, testUser);
    const home = findLinkByText(navItems, "Home");
    expect(home).toBeTruthy();
  });

  test("collectNavigationItems respects access control for authenticated pages", () => {
    const navItems = collectNavigationItems(navWithDefaults, null);
    const authPage = findLinkByText(navItems, "Authenticated Page");
    expect(authPage).toBeUndefined();
  });

  test("collectNavigationItems respects access control for authenticated pages as a logged in user", () => {
    const navItems = collectNavigationItems(navWithDefaults, testUser);
    const authPage = findLinkByText(navItems, "Authenticated Page");
    expect(authPage).toBeTruthy();
  });

  test("collectNavigationItems respects access control for role-specific pages", () => {
    const navItems = collectNavigationItems(navWithDefaults, null);
    const rolePage = findLinkByText(navItems, "Role Specific Page");
    expect(rolePage).toBeUndefined();
  });

  test("collectNavigationItems respects access control for role-specific pages as a logged in user", () => {
    const navItems = collectNavigationItems(navWithDefaults, testUser);
    const rolePage = findLinkByText(navItems, "Role Specific Page");
    expect(rolePage).toBeTruthy();
  });
});
