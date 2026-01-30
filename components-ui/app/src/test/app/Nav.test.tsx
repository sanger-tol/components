/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { expect, test, describe } from "vitest";
import {
  systemDefaultNavConfig,
  TNavConfig,
  collectNavigationItems,
  normaliseNavConfig,
  setupNavigationConfig,
} from "../../tol-ui/src";
import {
  findDropdownByTitle,
  findLinkByText,
  mockAdminUser,
  navOutputConfigPublicMock,
  navInputConfigMock,
  navOutputConfigAdminMock,
  navOutputConfigAuthenticatedMock,
  mockBasicUser,
  mockNoRoleUser,
} from "..";
import { navOutputConfigRoleRequiredMock } from "../mocks/nav/role-required-output";


const navConfigWithDefaults: TNavConfig = setupNavigationConfig(navInputConfigMock, systemDefaultNavConfig, null);

describe("systemDefaultNavConfig function", () => {
  test("Check explicit routes aren't overwritten", () => {
    // Public page route check
    expect(navConfigWithDefaults.data["Public Page"].path?.["route"]).toEqual("/");
  });

  test("Check generated routes are correctly created", () => {
    // Public Dropdown -> Public Dropdown Public Page route check
    expect(
      navConfigWithDefaults.data["Public Dropdown"]["pages"]
        .data["Public Dropdown Public Page"].path?.["route"]
    ).toEqual("/public-dropdown-public-page");
  });

  test("Function ensures a combination of app and default configs", () => {
    // App page route check
    expect(navConfigWithDefaults.data["Public Page"].path?.["route"]).toEqual("/");

    // Default page route check - is explicitly added in the default config
    expect(navConfigWithDefaults.data["Callback"].path?.["route"]).toEqual("/callback");
  });
});

describe("Ensure normaliseNavConfig prunes inaccessible pages", () => {
  test("Confirm public access", () => {
    const publicNavConfig = normaliseNavConfig(navInputConfigMock, null);
    expect(publicNavConfig).toEqual(navOutputConfigPublicMock);
  });

  test("Confirm authenticated access", () => {
    const authenticatedNavConfig = normaliseNavConfig(navInputConfigMock, mockNoRoleUser);
    expect(authenticatedNavConfig).toEqual(navOutputConfigAuthenticatedMock);
  });

  test("Confirm role required access", () => {
    const basicUserConfig = normaliseNavConfig(navInputConfigMock, mockBasicUser);
    expect(basicUserConfig).toEqual(navOutputConfigRoleRequiredMock);
  });

  test("Confirm a role's access", () => {
    const adminNavConfig = normaliseNavConfig(navInputConfigMock, mockAdminUser);
    expect(adminNavConfig).toEqual(navOutputConfigAdminMock);
  });
});

describe("collectNavigationItems function", () => {
  const navItems = collectNavigationItems(navConfigWithDefaults);

  test("returns empty array when navigation is undefined", () => {
    const emptyNavItems = collectNavigationItems(undefined);
    expect(emptyNavItems).toEqual([]);
  });

  test("collects top-level links (e.g. Public Page) with correct href", () => {
    const home = findLinkByText(navItems, "Public Page");
    expect(home).toBeTruthy();
    expect(home?.props?.href).toBe("/");
  });

  test("collects dropdowns and recursively collects child links", () => {
    const dropdown = findDropdownByTitle(navItems, "Public Dropdown");
    expect(dropdown).toBeTruthy();

    const dropdownChildren = React.Children.toArray(dropdown!.props.children);
    const page = findLinkByText(dropdownChildren, "Public Dropdown Public Page");
    expect(page).toBeTruthy();
    expect(page?.props?.href).toBe("/public-dropdown-public-page");
  });

  test("ensure pages visible on the nav are only generated from the config order", () => {
    // hidden pages aren't included in the config order and so shouldn't appear in the nav
    const callback = findLinkByText(navItems, "Callback");
    expect(callback).toBeFalsy();
  });
});