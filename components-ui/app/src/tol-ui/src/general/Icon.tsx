/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  icon?: string;
  size?: string;
}

export function Icon(props: Props) {
  const { icon, size } = props;

  return (
    // @ts-ignore
    <span>
      <FontAwesomeIcon icon={`fa-solid fa-${icon}`} size={size} />
    </span>
  );
}
