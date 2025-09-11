/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Icon } from "..";


export interface PSort {
  attribute: string;
  sortable: boolean;
  sortByAttribute?: string;
  sortByType?: string;
}

export function Sort(props: PSort) {
  const { attribute, sortable, sortByAttribute, sortByType } = props;

  if (sortable) {
    if (attribute === sortByAttribute) {
      return (
        <Icon
          icon={sortByType === "asc" ? "arrow-up" : "arrow-down"}
          size="2xs"
          className="tol-sorting-arrows tol-sorting-arrow-active"
        />
      );
    } else {
      return (
        <Icon
          icon="arrows-up-down"
          size="2xs"
          className="tol-sorting-arrows"
        />
      );
    }
  }
}
