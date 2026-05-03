/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, PButton } from "..";

export interface PTabsNav {
  /**
   * The buttons to display in the tab navigation.
   */
  buttons: PButton[];
  /**
 * The ID of the active tab.
 * IDs must be provided to the buttons in order for this to work.
 */
  activeId?: string;
  /**
   * An extra class name to apply to the tab navigation container.
   */
  className: string;
}

export function TabsNav(props: PTabsNav) {
  const { buttons, activeId, className } = props;

  return (
    <div className={`tol-tabs-nav ${className}`}>
      {buttons.map((button) => (
        <Button
          key={`tol-tabs-nav-button-${button.id}`}
          outline={button.id !== activeId}
          {...button}
        />
      ))}
    </div>
  );
}
