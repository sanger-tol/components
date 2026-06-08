/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import { Avatar } from "rsuite";

export interface IProfileAvatar {
  /**
   * Size of the avatar, can be one of "xs", "sm", "md", "lg", or "xl". Default is "sm".
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Whether the avatar should be displayed as a circle. Default is true.
   */
  circle?: boolean;
  /**
   * Content to be displayed inside the avatar.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names to apply to the avatar.
   */
  className?: string;
}

export function ProfileAvatar(props: IProfileAvatar) {
  const { size = "sm", circle = true, children, className } = props;
  return (
    <Avatar
      size={size}
      circle={circle}
      className={`initials-avatar ${className ?? ""}`}
    >
      {children}
    </Avatar>
  );
}
