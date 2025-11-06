/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Placeholder } from "..";


export interface PVideoPlayer {
  host?: "youtube" | "vimeo";
  videoId?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export function VideoPlayer(props: PVideoPlayer) {
  let { host = "youtube", videoId, width, height, style } = props;

  let url = `https://www.youtube.com/embed/${videoId}`;

  if (host) {
    if (host === "vimeo") {
      url = `https://player.vimeo.com/video/${videoId}`;
    }
  }

  if (!videoId) {
    return (
      <Placeholder message={"Video coming soon..."} {...props} />
    );
  }

  return (
    <iframe
      src={url}
      title="Tol Embedded Video Player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ width: width, height: height, ...style }}
      className="tol-video-player"
    />
  );
}
