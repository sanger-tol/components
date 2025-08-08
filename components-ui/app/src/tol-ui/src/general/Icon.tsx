/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface PIcon {
  icon?: string;
  size?: string;
}

export function Icon(props: PIcon) {
  const { icon, size } = props;

  return (
    // @ts-ignore
    <FontAwesomeIcon icon={`fa-solid fa-${icon}`} size={size} />
  );
}
