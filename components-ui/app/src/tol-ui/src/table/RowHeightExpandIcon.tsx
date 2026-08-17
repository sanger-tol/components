/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon } from "..";


export interface PRowHeightExpandIcon {
  expanded: boolean;
  onClick: () => void;
}

export function RowHeightExpandIcon(props: PRowHeightExpandIcon) {
  const { expanded, onClick } = props;

  return (
    <Icon
      icon={expanded ? "arrow-up-long" : "arrow-down-long"}
      className="tol-row-expand-btn"
      onClick={onClick}
      tooltip="Expand Row"
    />
  );
}
