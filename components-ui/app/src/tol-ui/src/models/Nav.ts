/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface Default {
  name: string;
  auth?: boolean | string[];
  hidden?: boolean;
  removeOnAuth?: boolean;
}

export interface Page extends Default {
  element?: JSX.Element;
  detail?: JSX.Element;
  authElement?: JSX.Element;
} // eslint-disable-line

export interface Dropdown extends Default {
  // dropdown attributes override those from the page's
  pages?: Page[];
} // eslint-disable-line
