/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Fragment } from "react/jsx-runtime";
import { Button, Icon, TTabs } from "..";

export interface PTabsNav {
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
export function TabsNav(props: PTabsNav) {
  const { tabs, activeId, onReorder, className } = props;

  return (
    <div className={`tol-tabs-nav ${className}`}>
      {tabs.map((tab, index) => (
        <Fragment key={`tol-tabs-nav-tab-${index}`}>
          {tab.buttons.map((button) => (
            <Button
              {...button}
              className={
                `${button.className || ""} tol-tabs-nav-button ${button.id === activeId ? "active" : ""}`
              }
              key={`tol-tabs-nav-button-${button.id}`}
              // If any of the buttons in the tab are active, then the tab is active and should not have an outline.
              outline={!tab.buttons.some((b) => b.id === activeId)}
            />
          ))}
          {onReorder || (tab.icons && tab.icons.length > 0) ? (
            <div className="tol-tabs-nav-icon">
              {onReorder && (
                <Icon
                  key={`tol-tabs-nav-icon-grip`}
                  icon="grip-vertical"
                  onClick={() => onReorder([])}
                />
              )}
              {tab.icons && tab.icons.map((icon, index) => (
                <Icon
                  key={`tol-tabs-nav-icon-${index}`}
                  {...icon}
                />
              ))}
            </div>
          ): null}
        </Fragment>
      ))}
    </div>
  );
}
