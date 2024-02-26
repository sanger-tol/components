/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export default interface Page {
  name: string;
  auth?: boolean;
  admin?: boolean;
  hidden?: boolean;
  element?: JSX.Element;
  detail?: JSX.Element;
} // eslint-disable-line

export interface Dropdown {
  name: string;
  auth?: boolean;
  admin?: boolean;
  hidden?: boolean;
  detail?: JSX.Element;
  pages?: Page[]
} // eslint-disable-line
