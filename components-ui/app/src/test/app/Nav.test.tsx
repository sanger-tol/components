/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { expect, test, describe } from "vitest";
import { setupNavigationConfig, TNavConfig, collectNavigationItems, normaliseNavConfig } from "../../tol-ui/src";
import {
  findDropdownByTitle,
  findLinkByText,
  mockAdminUser,
  navOutputConfigPublicMock,
  navInputConfigMock,
  navOutputConfigAdminMock,
  navOutputConfigAuthenticatedMock,
  mockAuthenticatedUser
} from "..";


const navConfigWithDefaults: TNavConfig = setupNavigationConfig(navInputConfigMock, null);


describe("setupNavigationConfig function", () => {
  test("Check explicit routes aren't overwritten", () => {
    // Public page route check
    expect(navConfigWithDefaults.data["Public Page"].path?.["route"]).toEqual("/");
  });

  test("Check generated routes are correctly created", () => {
    // Public Dropdown -> Nested Public Page route check
    expect(
      navConfigWithDefaults.data["Public Dropdown"]["pages"].data["Nested Public Page"].path?.["route"]
    ).toEqual("/nested-public-page");
  });

  test("Function ensures a combination of app and default configs", () => {
    // App page route check
    expect(navConfigWithDefaults.data["Public Page"].path?.["route"]).toEqual("/");

    // Default page route check - is explicitly added in the default config
    expect(navConfigWithDefaults.data["Callback"].path?.["route"]).toEqual("/callback");
  });
});


describe("Ensure normaliseNavConfig prunes inaccessible pages", () => {
  test("Confirm a public user's config", () => {
    const publicNavConfig = normaliseNavConfig(navInputConfigMock, null);
    expect(publicNavConfig).toEqual(navOutputConfigPublicMock);
  });

  test("Confirm an admin user's config", () => {
    const adminNavConfig = normaliseNavConfig(navInputConfigMock, mockAdminUser);
    expect(adminNavConfig).toEqual(navOutputConfigAdminMock);
  });

  test("Confirm an authenticated user's config", () => {
    const authenticatedNavConfig = normaliseNavConfig(navInputConfigMock, mockAuthenticatedUser);
    expect(authenticatedNavConfig).toEqual(navOutputConfigAuthenticatedMock);
  });
});


describe("collectNavigationItems function", () => {
  const navItems = collectNavigationItems(navConfigWithDefaults, null);

  test("returns empty array when navigation is undefined", () => {
    const emptyNavItems = collectNavigationItems(undefined, null);
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
    const page1 = findLinkByText(dropdownChildren, "Nested Public Page");
    expect(page1).toBeTruthy();
    expect(page1?.props?.href).toBe("/nested-public-page");
  });

  test("ensure pages visible on the nav are only generated from the config order", () => {
    // hidden pages aren't included in the config order and so shouldn't appear in the nav
    const callback = findLinkByText(navItems, "Callback");
    expect(callback).toBeFalsy();
  });
});
