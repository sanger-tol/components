/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { TTabs } from "..";
import { SortableTab } from "./SortableTab";


export interface PSortableTabs {
  /**
   * The tabs to be displayed in the navigation, including their buttons and optional icons.
   */
  tabs: TTabs;
  /**
  * The ID of the active tab.
  * IDs must be provided to the buttons in order for this to work.
  */
  activeId?: string;
  /**
   * A callback function that is called when the tabs are reordered.
   */
  onReorder?: (orderedIds: string[]) => void;
  /**
   * An extra class name to apply to the tab navigation container.
   */
  className: string;
}

/**
 * A component that renders a navigation bar for tabs, including buttons and optional icons for each tab.
 * It also supports reordering of tabs if an `onReorder` callback is provided.
 */
export function SortableTabs(props: PSortableTabs) {
  const { tabs, activeId, onReorder, className } = props;

  // Use the first button's id as the tab identifier for sorting
  const tabIds = tabs.map((tab) => tab.buttons[0]?.id || "");

  return (
    <DragDropProvider onDragEnd={(event) => {
      if (!onReorder) return;
      const reordered = move(tabIds, event);
      onReorder(reordered);
    }}>
      <div className={`tol-tabs-nav ${className}`}>
        {tabs.map((tab, index) => (
          <SortableTab
            key={tabIds[index]}
            id={tabIds[index]}
            index={index}
            tab={tab}
            activeId={activeId}
            onReorder={onReorder}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
