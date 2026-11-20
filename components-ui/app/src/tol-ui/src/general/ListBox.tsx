/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { ReactNode } from "react";
import { CheckTree as RSCheckTree } from "rsuite";
import type { CheckTreeProps as RSCheckTreeProps } from "rsuite";

import { stopPropagation } from "..";

type ItemData = Parameters<NonNullable<RSCheckTreeProps["renderTreeNode"]>>[0];

/** Props for the ListBox component */
export interface PListBox {
  /** The available data to choose from */
  data: ItemData[];
  /** The currently selected values */
  value: any;
  /** Handler on change to provide the newly selected values */
  onChange: (values: any[]) => void;
  /** Render function for the JSX on the left side of each list item */
  renderItemLeft?: (itemData: ItemData) => ReactNode;
  /** Render function for the JSX on the right side of each list item */
  renderItemRight?: (itemData: ItemData) => ReactNode;
  /** Extra CSS classes */
  className?: string;
}

/** Like a MultipleSelect, but only the drop-down contents. */
// TODO Allow it to be used in a singleselect manner too
export function ListBox(props: PListBox) {
  const { data, value, onChange, renderItemLeft, renderItemRight } = props;

  return (
    <RSCheckTree
      className="tol-list-box"
      data={data}
      renderTreeNode={(node) => (
        <span className="tol-list-box__item">
          <span className="tol-list-box__item-left">
            {renderItemLeft ? renderItemLeft(node) : node.label}
          </span>
          <span
            className="tol-list-box__item-right"
            onMouseDown={stopPropagation}
            onClick={stopPropagation}
            onKeyDown={stopPropagation}
          >
            {renderItemRight ? renderItemRight(node) : null}
          </span>
        </span>
      )}
      value={value}
      onChange={onChange}
    />
  );
}
