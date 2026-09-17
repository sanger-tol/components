/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

/**
 * Identifies a video hosted by a supported external provider.
 *
 * The host determines how the video is embedded, and `videoId` identifies
 * the video within that provider.
 */
export interface IVideoDetails {
  /** Service hosting the video. */
  host: "youtube" | "vimeo";
  /** Service-specific identifier for the video. */
  videoId: string;
}
