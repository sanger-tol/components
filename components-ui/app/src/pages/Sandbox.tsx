/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  IconLinkTexts,
  SocialViewer,
  VideoPlayer,
} from "../tol-ui/src/general";

export function Sandbox() {
  return (
    <>
      <IconLinkTexts
        data={[
          {
            link: "https://github.com/",
          },
          {
            link: "https://gitlab.com/",
          },
          {
            link: "https://bluesky.app/",
          },
          {
            link: "https://www.linkedin.com/",
          },
          {
            link: "https://www.discord.com/",
          },
          {
            link: "https://www.slack.com/",
          },
          
        ]}
      />
      <VideoPlayer
        host="youtube"
        videoId="M7lc1UVf-VE"
        width={280}
        height={157}
      />
      <h2>Social Icons</h2>
      <SocialViewer
        data={[
          {
            name: "Social links",
            links: [
              { link: "https://github.com/", icon: "github" },
              { link: "https://gitlab.com/", icon: "gitlab" },
              { link: "https://www.linkedin.com/", icon: "linkedin" },
            ],
          },
        ]}
      />
      <h2>New Section</h2>
      <IconLinkTexts
        data={[
          {
            link: "https://google.com/",
            text: "Google",
            icon: "download",
          },
        ]}
      />

    </>
  );
}
