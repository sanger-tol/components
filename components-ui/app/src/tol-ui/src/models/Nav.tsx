/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

type Default = {
  name: string;
  auth?: boolean|string[];
  hidden?: boolean;
}

export type Page = Default & {
  element?: JSX.Element;
  detail?: JSX.Element;
};

export type Dropdown = Default & {
  // dropdown attributes override those from the page's
  pages?: Page[];
} // eslint-disable-line
