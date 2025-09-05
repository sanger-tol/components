/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import {
  TNameAndLinks,
  SocialViewer,
} from "../tol-ui/src/general/SocialViewer";
import { Widgets } from "../tol-ui/src";

const speakers: TNameAndLinks = [
  {
    name: "Kiernan Harding",
    links: [
      { link: "https://twitter.com/kiernan", icon: "twitter" },
      { link: "https://github.com/kiernan", icon: "github" },
      { link: "www.externallink.com", icon: "link" },
    ],
  },
  {
    name: "Luke Wilson",
    links: [{ link: "https://linkedin.com/in/luke", icon: "linkedin" }],
  },
];

export function Sandbox() {
  const Viewer = <SocialViewer data={speakers} />;

  const components = [
    {
      component: Viewer,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}
