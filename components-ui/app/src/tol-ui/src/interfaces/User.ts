/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IUser {
  id: string;
  oidc_id?: string;
  email: string;
  name: string | any;
  organisation: string;
  roles: string[];
  token_created_at?: string;
  token_expires_at?: string;
  tours_seen: Record<string, boolean> | null;
} // eslint-disable-line
