/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useSortable } from "@dnd-kit/react/sortable";
import { Button, Icon, ITab } from "..";

export interface PSortableTab {
  /**
   * The unique identifier for the sortable tab.
   */
  id: string;
  /**
   * The index of the tab in the list.
   */
  index: number;
  /**
   * The tab data including buttons and optional icons.
   */
  tab: ITab;
  /**
   * Whether the tab is currently active.
   * This will determine the styling of the tab and its buttons.
   */
  active?: boolean;
  /**
   * If provided, indicates that reordering is enabled and a grip icon should be shown.
   */
  onReorder?: (orderedIds: string[]) => void;
}

/**
 * A sortable tab item that can be dragged to reorder within the tab navigation.
 */
export function SortableTab(props: PSortableTab) {
  const { id, index, tab, active = false, onReorder } = props;

  const { ref } = useSortable({ id, index });

  return (
    <div ref={ref} className="tol-tabs-nav-tab">
      {tab.buttons.map((button, i) => (
        <Button
          {...button}
          key={`tol-tabs-nav-button-${button.id ?? i}`}
          outline={!active}
        />
      ))}
      {onReorder || (tab.icons && tab.icons.length > 0) ? (
        <div className="tol-tabs-nav-icon">
          {onReorder && (
            <Icon
              key="tol-tabs-nav-icon-grip"
              className="tol-tabs-nav-icon tol-grip"
              icon="grip-vertical"
            />
          )}
          {tab.icons &&
            tab.icons.map((icon, i) => (
              <Icon
                key={`tol-tabs-nav-icon-${i}`}
                className="tol-tabs-nav-icon"
                {...icon}
              />
            ))}
        </div>
      ) : null}
    </div>
  );
}
