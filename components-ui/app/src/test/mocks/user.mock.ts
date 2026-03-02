/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { User } from "../../tol-ui/src";


export const mockNoRoleUser: User = {
  id: "1",
  oidc_id: "123",
  email: "user@test.com",
  name: "Test User",
  organisation: "Test Organisation",
  roles: [],
};

export const mockBasicUser: User = {
  id: "2",
  oidc_id: "456",
  email: "basic@test.com",
  name: "Basic User",
  organisation: "Test Organisation",
  roles: ["basic"],
};

export const mockAdminUser: User = {
  id: "3",
  oidc_id: "789",
  email: "admin@test.com",
  name: "Admin User",
  organisation: "Test Organisation",
  roles: ["admin"],
};
