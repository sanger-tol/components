/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  getFieldAnchorId,
  getNavGroups,
  cleanTitle,
  prettify,
  useScrollSpy,
} from "..";

export interface PSideNavBar {
  /** The section of the genome note being edited (e.g., "genome", "taxonomy", etc.). */
  section: string;
  /** The key of the currently active section or field in the editor. */
  activeKey: string;
}

/** Renders navigation for the active genome note section. */
export function SideNavBar(props: PSideNavBar) {
  const { section, activeKey } = props;

  const { activeSubSection, scrollToAnchor } = useScrollSpy({
    activeKey,
  });

  return (
    <nav className="tol-gn-sidenav">
      {getNavGroups(section).map((group) => {
        const groupActive = group.subSection === activeSubSection;
        return (
          <div key={group.subSection} className="tol-gn-sidenav-group">
            <div
              role="button"
              tabIndex={0}
              className={`tol-gn-sidenav-group-header${groupActive ? " active" : ""}`}
              onClick={() =>
                scrollToAnchor(
                  getFieldAnchorId(
                    section,
                    group.subSection,
                    group.fields[0].field.name,
                    group.fields[0].index,
                  ),
                )
              }
            >
              {prettify(group.subSection)}
            </div>
            <ul
              className={`tol-gn-sidenav-group-list ${groupActive ? "active" : ""}`}
            >
              {group.fields.map(({ field, index }) => {
                const anchorId = getFieldAnchorId(
                  section,
                  group.subSection,
                  field.name,
                  index,
                );
                return (
                  <li key={anchorId}>
                    <div
                      role="button"
                      tabIndex={0}
                      className={`tol-gn-sidenav-field ${groupActive ? "active" : ""}`}
                      onClick={() => scrollToAnchor(anchorId)}
                    >
                      {cleanTitle(field.label)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
