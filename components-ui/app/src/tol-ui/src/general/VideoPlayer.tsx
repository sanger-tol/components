/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface PVideoPlayer {
  host?: "youtube" | "vimeo";
  videoId: string;
  width?: string | number;
  height?: string | number;
}

export function VideoPlayer(props: PVideoPlayer) {
  let { host = "youtube", videoId, width, height } = props;

  let url = `https://www.youtube.com/embed/${videoId}`;

  if (host) {
    if (host === "vimeo") {
      url = `https://player.vimeo.com/video/${videoId}`;
    }
  }

  if (height === undefined && width !== undefined) {
    height = Number(width) * (9 / 16);
  } else if (width === undefined && height !== undefined) {
    width = Number(height) * (16 / 9);
  }else if (height === undefined && width == undefined) {
    height = 300;
    width = 500;
  }

console.log(width, height);

  return (
    <iframe
      src={url}
      title="Tol Embedded Video Player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ width: width, height: height }}
    />
  );
}
