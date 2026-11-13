/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { KeyboardEvent } from "react";
import type { IScrollNavGroup } from "..";

export interface PFormSideNavBar {
  /** Sub-section groups to list, in render order. */
  groups: IScrollNavGroup[];
  /** The sub-section currently in view. */
  activeSubSection?: string;
  /** Called with the anchor id of the clicked group or field. */
  onSelect: (anchorId: string) => void;
}

function onActivate(handler: () => void) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: handler,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handler();
      }
    },
  };
}

/** Lists a form's sub-sections and fields, highlighting the one in view. */
export function FormSideNavBar(props: PFormSideNavBar) {
  const { groups, activeSubSection, onSelect } = props;

  return (
    <nav className="tol-form-sidenav">
      {groups.map((group) => {
        const active = group.subSection === activeSubSection ? " active" : "";
        return (
          <div key={group.subSection} className="tol-form-sidenav-group">
            <div
              className={`tol-form-sidenav-group-header${active}`}
              {...onActivate(() => onSelect(group.fields[0].anchorId))}
            >
              {group.label}
            </div>
            <ul className={`tol-form-sidenav-group-list${active}`}>
              {group.fields.map((field) => (
                <li key={field.anchorId}>
                  <div
                    className={`tol-form-sidenav-field${active}`}
                    {...onActivate(() => onSelect(field.anchorId))}
                  >
                    {field.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
