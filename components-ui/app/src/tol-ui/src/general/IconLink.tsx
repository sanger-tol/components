/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { Icon } from ".";

export interface PIconLinkBase {
  /** URL opened when the link is activated. */
  link: string;
  /** Font Awesome icon name; detected from the URL when omitted. */
  icon?: string;
  /** Font Awesome icon style, such as `solid`, `regular`, or `brands`. */
  config?: string;
  /** Font Awesome icon size. */
  size?: string;
  /** Additional CSS class names applied to the link. */
  className?: string;
}

/** Props for a link containing an icon. */
export interface PIconLink extends PIconLinkBase {}

export interface PIconLinkText extends PIconLinkBase {
  /** Text displayed beside the icon; detected from the URL when omitted. */
  text?: string;
}

export interface PIconLinkTextsViewer {
  /** Icon links to display. */
  data: PIconLinkText[];
  /** Additional CSS class names applied to the viewer. */
  className?: string;
}

interface IDetectedLinkDetails {
  icon?: string;
  text?: string;
  config?: string;
}

export interface IIconProvider {
  icon: string;
  text: string;
}

export const KNOWN_ICON_PROVIDERS: Record<string, IIconProvider> = {
    bluesky: { icon: "bluesky", text: "Bluesky" },
    discord: { icon: "discord", text: "Discord" },
    facebook: { icon: "facebook", text: "Facebook" },
    github: { icon: "github", text: "GitHub" },
    gitlab: { icon: "gitlab", text: "GitLab" },
    kasm: { icon: "cloud", text: "Kasm" },
    linkedin: { icon: "linkedin", text: "LinkedIn" },
    slack: { icon: "slack", text: "Slack" },
    wechat: { icon: "weixin", text: "WeChat" },
    zoom: { icon: "zoom", text: "Zoom" }
};

export function isKnownIconLink(link: string): boolean {
  return Object.keys(KNOWN_ICON_PROVIDERS).some((name) =>
    link.toLowerCase().includes(name)
  );
}

function detectLinkDetails(link: string): IDetectedLinkDetails {
  const provider = Object.keys(KNOWN_ICON_PROVIDERS).find((name) =>
    link.toLowerCase().includes(name)
  );

  return provider
    ? {
        icon: KNOWN_ICON_PROVIDERS[provider].icon,
        text: KNOWN_ICON_PROVIDERS[provider].text,
        config: "brands",
      }
    : {};
}

function IconLinkBase(props: PIconLinkBase & { children?: ReactNode }) {
  const {
    link,
    icon: providedIcon,
    config: providedConfig,
    size = "2x",
    className,
    children,
  } = props;
  const detectedDetails = detectLinkDetails(link);
  const icon = providedIcon ?? detectedDetails.icon;
  const config = providedConfig ?? detectedDetails.config ?? "solid";

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`icon tol-icon-link-text${className ? ` ${className}` : ""}`}
    >
      {icon && <Icon icon={icon} config={config} size={size} />}
      {children}
    </a>
  );
}

/**
 * @autodoc
 *
 * Renders an icon inside a link, detecting the icon and style from known provider URLs when
 * they are omitted.
 */
export function IconLink(props: PIconLink) {
  return <IconLinkBase {...props} />;
}

/**
 * @autodoc
 *
 * Renders an icon link with a text label, detecting both values from known provider URLs when
 * they are omitted.
 */
export function IconLinkText(props: PIconLinkText) {
  const { link, text: providedText, ...linkProps } = props;
  const detectedDetails = detectLinkDetails(link);
  const text = providedText ?? detectedDetails.text;
  return <IconLinkBase link={link} {...linkProps}>{text}</IconLinkBase>;
}

/**
 * @autodoc
 *
 * Renders a vertical list of icon links with optional text labels, detecting missing values from
 * known provider URLs.
 */
export function IconLinkTextsViewer(props: PIconLinkTextsViewer) {
  const { data, className } = props;
  return (
    <div className={`tol-icon-link-texts-viewer${className ? ` ${className}` : ""}`}>
      {data.map((item, index) => (
        <IconLinkText key={index} {...item} />
      ))}
    </div>
  );
}