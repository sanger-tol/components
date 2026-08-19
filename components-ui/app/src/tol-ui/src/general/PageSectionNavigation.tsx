/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { usePageSectionNavigation } from "..";
import type { IPageSectionNavigationItem } from "..";

export interface PPageSectionNavigation {
  /** Ordered links to section elements on the current page. */
  items: IPageSectionNavigationItem[];
  /** Viewport ratio used to determine the active section. */
  activeOffsetRatio?: number;
}

/**
 * @autodoc
 *
 * Renders sticky in-page navigation with scroll-driven active section state.
 * On narrow viewports the links become a horizontally scrollable row.
 */
export function PageSectionNavigation({
  items,
  activeOffsetRatio,
}: PPageSectionNavigation) {
  const { activeId, setActiveId } = usePageSectionNavigation({
    items,
    activeOffsetRatio,
  });

  if (items.length === 0) return null;

  return (
    <nav aria-label="Page sections" className="tol-page-section-navigation">
      <div className="tol-page-section-navigation__links">
        {items.map((item) => (
          <a
            aria-current={activeId === item.id ? "location" : undefined}
            className={activeId === item.id ? "active" : undefined}
            href={`#${item.id}`}
            key={item.id}
            onClick={() => setActiveId(item.id)}
          >
            {item.title}
          </a>
        ))}
      </div>
    </nav>
  );
}
