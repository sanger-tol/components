/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import videojs from "video.js";
import { useEffect, useRef } from "react";
import "video.js/dist/video-js.css";

export type TVideoConfig = IVideoConfig;

export interface IVideoConfig {
  autoplay: boolean;
  controls: boolean;
  sources: Tsources;
}

export type Tsources = ISources[];

export interface ISources {
  src: string;
  type: string;
}

export interface IVideoSetter {
  options: TVideoConfig;
}

export function VideoPlayer(props: IVideoSetter) {
  const { options } = props;

  const videoNode = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<videojs.js | null>(null);

  useEffect(() => {
    if (videoNode.current) {
      playerRef.current = videojs(videoNode.current, options, () => {
        videojs.log("on Player ready", playerRef.current);
      });
      return()=>{
        if(playerRef.current){
            playerRef.current.dispose();
        }
      }
    }
  },[options]);

  return (
    <div data-vjs-player>
      <video ref={videoNode} className="video-js" />
    </div>
  );
}
