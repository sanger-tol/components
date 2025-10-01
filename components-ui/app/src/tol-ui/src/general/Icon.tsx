/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface PIcon {
  icon?: string;
  size?: string;
  config?: string;
  className?: string;
}

export function Icon(props: PIcon) {
  const { icon, size, config = "solid", className } = props;

  return (
    <span className={className}>
      {/* @ts-ignore */}
      <FontAwesomeIcon icon={`fa-${config} fa-${icon}`} size={size} />
    </span>
  );
}
