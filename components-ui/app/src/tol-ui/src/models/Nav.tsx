/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface Default {
  name: string;
  auth?: boolean;
  admin?: boolean;
  hidden?: boolean;
}

export default interface Page extends Default {
  element?: JSX.Element;
  detail?: JSX.Element;
} // eslint-disable-line

export default interface Dropdown extends Default {
  // dropdown attributes override those from the page's
  pages?: Page[];
} // eslint-disable-line
