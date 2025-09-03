/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import {
  TNameAndLinks,
  SocialViewer,
} from "../tol-ui/src/general/SocialViewer";
import { Widgets } from "./Widgets";

const speakers: TNameAndLinks = [
  {
  name: "Kiernan Harding",
    links: [
      { link: "https://twitter.com/kiernan", icon: "twitter" },
      { link: "https://github.com/kiernan", icon: "github" },
    ],
  },
  {
    name: "Luke Wilson",
    links: [{ link: "https://linkedin.com/in/luke", icon: "linkedin" }],
  },
];

export function Sandbox() {
  const viewer = (
    <div>
      {speakers.map((speakerDetails, index) => (
        <SocialViewer key={index} {...speakerDetails} />
      ))}
    </div>
  );

  const components = [
    {
      component: viewer,
      type: "full",
    },
  ];

  return <Widgets components={components} />;;
}
