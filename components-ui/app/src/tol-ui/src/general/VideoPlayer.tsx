/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IVideoSetter {
  videoId: string;
  width?: string | number;
  height?: string | number;
}

export function VideoPlayer(props: IVideoSetter) {
  const { videoId, width = 500, height = 300 } = props;
  const url = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div
      className="tol-video-container"
    >
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
