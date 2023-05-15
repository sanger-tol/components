/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export default interface Page {
  name: string;
  authRequired?: boolean;
  adminOnly?: boolean;
  uiElement: JSX.Element;
}
