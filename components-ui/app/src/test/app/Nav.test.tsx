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




// describe("collectNavigationItems function", () => {
//   const navItems = collectNavigationItems(navConfig, null);
//   const emptyNavItems = collectNavigationItems(undefined, null);

//   test("returns empty array when navigation is undefined", () => {
//     expect(emptyNavItems).toEqual([]);
//   });

//   test("collects top-level links (e.g. Home) with correct href", () => {
//     const home = findLinkByText(navItems, "Home");
//     expect(home).toBeTruthy();
//     expect(home?.props?.href).toBe("/");
//   });

//   test("collects dropdowns and recursively collects child links", () => {
//     const dropdown = findDropdownByTitle(navItems, "Dropdown Name 1");
//     expect(dropdown).toBeTruthy();

//     const dropdownChildren = React.Children.toArray(dropdown!.props.children);
//     const page1 = findLinkByText(dropdownChildren, "Page Name 1");

//     expect(page1).toBeTruthy();
//     expect(page1?.props?.href).toBe("/page-name-1");
//   });
// });



// describe("test navigation access control", () => {
//   const navItems = collectNavigationItems(navConfig, null);
//   const navItemsWhenAdmin = collectNavigationItems(navConfig, mockAdminUser);

//   test("collectNavigationItems returns public pages when not logged in", () => {
//     const home = findLinkByText(navItems, "Home");
//     expect(home).toBeTruthy();
//   });

//   test("collectNavigationItems returns public pages when logged in", () => {
//     const home = findLinkByText(navItemsWhenAdmin, "Home");
//     expect(home).toBeTruthy();
//   });

//   test("collectNavigationItems does not return authenticated pages when not logged in", () => {
//     const authPage = findLinkByText(navItems, "Authenticated Page");
//     expect(authPage).toBeUndefined();
//   });

//   test("collectNavigationItems returns authenticated pages when logged in", () => {
//     const authPage = findLinkByText(navItemsWhenAdmin, "Authenticated Page");
//     expect(authPage).toBeTruthy();
//   });

//   test("collectNavigationItems does not return role-specific pages when not logged in", () => {
//     const rolePage = findLinkByText(navItems, "Role Specific Page");
//     expect(rolePage).toBeUndefined();
//   });

//   test("collectNavigationItems returns role-specific pages when logged in", () => {
//     const rolePage = findLinkByText(navItemsWhenAdmin, "Role Specific Page");
//     expect(rolePage).toBeTruthy();
//   });
// });
