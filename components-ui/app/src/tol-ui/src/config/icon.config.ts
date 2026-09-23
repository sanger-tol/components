/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IIconBrand } from "..";

export const KNOWN_ICON_BRANDS: Record<string, IIconBrand> = {
    bluesky: { icon: "bluesky", text: "Bluesky" },
    discord: { icon: "discord", text: "Discord" },
    facebook: { icon: "facebook", text: "Facebook" },
    github: { icon: "github", text: "GitHub" },
    gitlab: { icon: "gitlab", text: "GitLab" },
    kasm: { icon: "cloud", text: "Kasm", config: "solid" },
    linkedin: { icon: "linkedin", text: "LinkedIn" },
    slack: { icon: "slack", text: "Slack" },
    wechat: { icon: "weixin", text: "WeChat" },
    zoom: { icon: "video", text: "Zoom", config: "solid" }
} as const;
