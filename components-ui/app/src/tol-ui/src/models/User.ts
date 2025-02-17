/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface User {
  email: string;
  name: string | any;
  organisation: string;
  roles: string[];
  oidc_id?: string;
} // eslint-disable-line
