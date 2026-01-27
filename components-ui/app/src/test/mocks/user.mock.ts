/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { User } from "../../tol-ui/src";

export const adminUser: User = {
  email: "user@test.ac.uk",
  name: "Test User",
  organisation: "Test Organisation",
  roles: ["admin"],
  oidc_id: "12345",
};
