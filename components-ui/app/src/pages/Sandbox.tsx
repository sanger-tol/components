/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IconLinkTextsViewer, VideoPlayer } from "../tol-ui/src/general";

export function Sandbox() {
  return (
    <>
      <IconLinkTextsViewer
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
        ]}
      />
      <VideoPlayer
        host="youtube"
        videoId="M7lc1UVf-VE"
        width={280}
        height={157}
      />
      <h2>New Section</h2>
      <IconLinkTextsViewer
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
