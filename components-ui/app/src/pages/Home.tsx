/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Header, HeaderButton } from "../tol-ui/src";

const docs: HeaderButton = {
  href: "https://ssg-confluence.internal.sanger.ac.uk/display/TOL/ToL+UI+Library",
  text: "Documentation",
};

export function Home() {
  return (
    <div className="home">
      <Header
        title="Components"
        subTitle="Tree of Life UI"
        buttons={[docs]}
        pageEmpty
      />
    </div>
  );
}
