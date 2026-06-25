/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IUser } from "../../tol-ui/src";


export const mockNoRoleUser: IUser = {
  id: "1",
  oidc_id: "123",
  email: "user@test.com",
  name: "Test User",
  organisation: "Test Organisation",
  roles: [],
};

export const mockBasicUser: IUser = {
  id: "2",
  oidc_id: "456",
  email: "basic@test.com",
  name: "Basic User",
  organisation: "Test Organisation",
  roles: ["basic"],
};

export const mockAdminUser: IUser = {
  id: "3",
  oidc_id: "789",
  email: "admin@test.com",
  name: "Admin User",
  organisation: "Test Organisation",
  roles: ["admin"],
};
