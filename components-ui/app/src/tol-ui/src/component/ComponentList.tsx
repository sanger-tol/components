/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactElement, cloneElement } from "react";
import { ComponentBase } from "..";
import type { IComponentData, IComponentListData } from "..";


/** Props for rendering repeated instances of a data component. */
export interface PComponentList extends IComponentListData {
  /** Current page, used to keep instance IDs unique between pages. */
  page: number;
  /** Component used to render each record. */
  children: ReactElement<IComponentData>;
}

/** Renders one component per record in a vertically scrollable list. */
export function ComponentList(props: PComponentList) {
  const { id, page, data = [], fields, children, ...rest } = props;

  return (
    <ComponentBase {...rest} id={id}>
      <div className="tol-component-list-scroll">
        {data.map((record, index) => (
          <div className="tol-component-list-scroll-item" key={`${page}-${index}`}>
            {cloneElement(children, {
              id: `${id}-${page}-${index}`,
              data: record,
              fields,
              // Let each repeated component size to its contents rather than fill the list.
              height: "auto",
              // The list owns the shared utility bar, so repeated components must not render one.
              utilityBarConfig: null,
              // Clear inherited override contents so each component renders its record body.
              contents: undefined,
            })}
          </div>
        ))}
      </div>
    </ComponentBase>
  );
}