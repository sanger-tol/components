/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface PIcon {
  icon?: string;
  size?: string;
  config?: string;
}

export function Icon(props: PIcon) {
  const { icon, size, config } = props;
// {console.log(`<FontAwesomeIcon icon={fa-${config} fa-${icon}} size={size} />`)}
  return (
    
    <span>
      {/* @ts-ignore */}
      {
        config? (<FontAwesomeIcon icon={`fa-${config} fa-${icon}`} size={size} />) : (<FontAwesomeIcon icon={`fa-solid fa-${icon}`} size={size} />)
      }
    </span>
  );
}
