/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { SocialViewer } from "../tol-ui/src/general/SocialViewer";

const data = [
  {
    name: "Luke",
    links: [
      {
        link: "https://linkedin.com/in/luke",
        icon: "linkedin",
      },
    ],
  },
  {
    name: "Nithin",
    links: [
      {
        link: "https://linkedin.com/in/nithin",
        icon: "linkedin",
      },
    ],
  },
];
export function Sandbox() {
  return (
    <div style={{ padding: "10px" }}>
      <SocialViewer data={data} />
    </div>
  );
}
