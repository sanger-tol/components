/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export type TVideoConfig = IVideoConfig;

export interface IVideoConfig {
  techOrder?: string[];
  autoplay: boolean;
  controls: boolean;
  sources: Tsources;
}

export type Tsources = ISources[];

export interface ISources {
  src: string;
  type: string;
}
