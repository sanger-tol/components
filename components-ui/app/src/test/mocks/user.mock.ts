/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { User } from "../../tol-ui/src";


export const mockNoRoleUser: User = {
  email: "user@test.com",
  name: "Test User",
  organisation: "Test Organisation",
  roles: [],
  oidc_id: "123",
};

export const mockBasicUser: User = {
  email: "basic@test.com",
  name: "Basic User",
  organisation: "Test Organisation",
  roles: ["basic"],
  oidc_id: "456",
};

export const mockAdminUser: User = {
  email: "admin@test.com",
  name: "Admin User",
  organisation: "Test Organisation",
  roles: ["admin"],
  oidc_id: "789",
};
