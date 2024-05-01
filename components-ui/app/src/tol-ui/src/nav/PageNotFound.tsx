/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Header, HeaderButton } from "../index";


const home: HeaderButton = {
  href: "/",
  text: "Go back home"
};

function PageNotFound() {
  return (
    <Header
      title="Oops! You seem to be lost."
      buttons={[home]}
      pageEmpty
    />
  );
}

export default PageNotFound;
