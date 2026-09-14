/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IconLinkTextsViewer } from "../tol-ui/src/general";

export function Sandbox() {
  return (
    <IconLinkTextsViewer
      data={[
        {
          link: "https://github.com/",
          icon: "github",
          config: "brands",
          text: "GitHub",
        },
        {
          link: "https://gitlab.com/",
          icon: "gitlab",
          config: "brands",
          text: "GitLab",
        },
        {
          link: "https://bluesky.app/",
          icon: "bluesky",
          config: "brands",
          text: "Bluesky",
        },
        {
          link: "https://www.linkedin.com/",
          icon: "linkedin",
          config: "brands",
          text: "LinkedIn",
        },
      ]}
    />
  );
}
