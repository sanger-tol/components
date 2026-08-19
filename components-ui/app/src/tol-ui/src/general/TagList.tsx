/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ReactNode } from "react";

import { Tag } from "./Tag";
import type { PTag } from "./Tag";

export interface ITagListItem extends Omit<PTag, "children"> {
  /** Stable identifier for the tag. */
  id: string;
  /** Content displayed inside the tag. */
  label: ReactNode;
}

export interface PTagList {
  /** Tags to display in list order. */
  items: ITagListItem[];
}

/**
 * @autodoc
 *
 * Renders a list of Tol UI tags.
 */
export function TagList({ items }: PTagList) {
  if (items.length === 0) return null;

  return (
    <ul>
      {items.map(({ id, label, ...tagProps }) => (
        <li key={id}>
          <Tag {...tagProps}>{label}</Tag>
        </li>
      ))}
    </ul>
  );
}
