/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { Icon } from ".";

export interface PIconLinkBase {
  link: string;
  icon: string;
  config?: string;
  size?: string;
  className?: string;
}

export interface PIconLink extends PIconLinkBase {}

export interface PIconLinkText extends PIconLinkBase {
  text: string;
}

export interface PIconLinkTextsViewer {
  data: PIconLinkText[];
  className?: string;
}

function IconLinkBase(props: PIconLinkBase & { children?: ReactNode }) {
  const {
    link,
    icon,
    config = "solid",
    size = "2x",
    className,
    children,
  } = props;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`icon${className ? ` ${className}` : ""}`}
    >
      <Icon icon={icon} config={config} size={size} />
      {children}
    </a>
  );
}

export function IconLink(props: PIconLink) {
  return <IconLinkBase {...props} />;
}

export function IconLinkText(props: PIconLinkText) {
  const { text, ...linkProps } = props;
  return <IconLinkBase {...linkProps}>{text}</IconLinkBase>;
}

export function IconLinkTextsViewer(props: PIconLinkTextsViewer) {
  const { data, className } = props;
  return (
    <div className={className}>
      {data.map((item, index) => (
        <IconLinkText key={index} {...item} />
      ))}
    </div>
  );
}