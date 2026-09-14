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

function detectLinkDetails(link: string): IDetectedLinkDetails {
  const knownProviders: Record<string, string> = {
    bluesky: "Bluesky",
    discord: "Discord",
    facebook: "Facebook",
    github: "GitHub",
    gitlab: "GitLab",
    linkedin: "LinkedIn",
    slack: "Slack",
  };
  const provider = Object.keys(knownProviders).find((name) =>
    link.toLowerCase().includes(name)
  );

  return provider
    ? {
        icon: provider,
        text: knownProviders[provider],
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