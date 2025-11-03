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
}

export function VideoPlayer(props: PVideoPlayer) {
  let { host = "youtube", videoId, width, height } = props;

  if (!videoId) {
    if (!width && !height) {
      width = "300px";
      height = `${Number(width.replace("px", "")) * (9 / 16)}px`;
    }
    if (height && !width) {
      if (typeof height === "string") {
        width = `${Number(height.replace("px", "")) * (16 / 9)}px`;
      } else {
        width = Number(height) * (16 / 9);
      }
    }
    return (
      <div
        style={{
          width: width,
          border: "2px solid var(--tol-grey-subtle)",
          borderRadius: "6px",
        }}
      >
        <Placeholder message={"Video coming soon..."} height={height} />
      </div>
    );
  }

  let url = `https://www.youtube.com/embed/${videoId}`;

  if (host) {
    if (host === "vimeo") {
      url = `https://player.vimeo.com/video/${videoId}`;
    }
  }

  if (!height && width) {
    if (typeof width === "string") {
      height = `${Number(width.replace("px", "")) * (9 / 16)}px`;
    } else {
      height = Number(width) * (9 / 16);
    }
  } else if (!width && height) {
    if (typeof height === "string") {
    width = `${Number(height.replace("px", "")) * (16 / 9)}px`;
    }
    else{
      width = Number(height) * (16 / 9);
    }
  }

  return (
    <iframe
      src={url}
      title="Tol Embedded Video Player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ width: width, height: height }}
      className="tol-video-player"
    />
  );
}
