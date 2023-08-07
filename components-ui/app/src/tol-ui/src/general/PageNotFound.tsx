/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Header, HeaderButton } from "../index";


const home: HeaderButton = {
  href: "/",
  text: "Go back home"
}

function PageNotFound() {
  return (
    <Header
      title="Page Not Found"
      buttons={[home]}
    />
  )
}

export default PageNotFound;