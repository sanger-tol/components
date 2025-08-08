/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Header, IHeaderButton } from "..";

const home: IHeaderButton = {
  href: "/",
  text: "Go back home",
};

export function PageNotFound() {
  return (
    <Header title="Oops! You seem to be lost." buttons={[home]} pageEmpty />
  );
}
