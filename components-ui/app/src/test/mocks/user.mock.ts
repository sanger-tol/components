/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { User } from "../../tol-ui/src";


export const mockAuthenticatedUser: User = {
  email: "user@test.com",
  name: "Test User",
  organisation: "Test Organisation",
  roles: [],
  oidc_id: "12345",
};

export const mockAdminUser: User = {
  email: "admin@test.com",
  name: "Admin User",
  organisation: "Test Organisation",
  roles: ["admin"],
  oidc_id: "67890",
};
