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
  const { host = "youtube", videoId, width = 500, height = 300 } = props;

  let url = `https://www.youtube.com/embed/${videoId}`;

  if (host) {
    if (host === "vimeo") {
      url = `https://player.vimeo.com/video/${videoId}`;
    }
    // ==>Todo: Add conditions based on the host
  }

  return (
    <div className="tol-video-container">
      <iframe
        src={url}
        title="Tol Embedded Video Player"
        width={width}
        height={height}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="tol-video-player"
      ></iframe>
    </div>
  );
}
