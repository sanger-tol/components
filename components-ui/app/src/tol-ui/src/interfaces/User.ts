/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import type { TUserProfileFormDataOrNull } from "..";

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

/* Functions related to user profile management. */
export interface IUserProfileFunctions {
  /** Transform form valuse into the upsert payload */
  transformSubmitData?: (
    formData: object,
    currentData: TUserProfileFormDataOrNull,
  ) => object | Promise<object>;
  /** Return an error message to abort submission, or null to proceed. */
  validateSubmission?: (
    formData: object,
    currentData: TUserProfileFormDataOrNull,
  ) => string | null;
  /** Called after a successful save that completed the profile for the first time. */
  onFirstSubmitSuccess?: () => void;
  /** Transform persisted data into form-ready values. */
  transformInitialData?: (data: TUserProfileFormDataOrNull) => object;
}
