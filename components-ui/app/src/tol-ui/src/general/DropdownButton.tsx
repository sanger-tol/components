/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Dropdown } from "rsuite";
import { Button, Icon } from "..";
import type { PButton } from "..";


export interface PDropdownButton {
  /**
   * The button that toggles the dropdown.
   */
  toggle: PButton;
  /**
   * An array of buttons to display in the dropdown menu.
   */
  buttons: PButton[];
  /**
   * Placement of the dropdown menu relative to the toggle button.
   */
  placement?: string;
}

/**
 * Renders a dropdown button using rsuite's Dropdown component
 * and the PButton interface.
 */
export function DropdownButton(props: PDropdownButton) {
  const { toggle, buttons, placement } = props;

  const renderButton = (propsToggle: any, ref: React.Ref<HTMLButtonElement>) => {
    const { disabled, ...restToggle } = propsToggle;
    return <Button ref={ref} {...toggle} {...restToggle} />;
  };

  return (
    <Dropdown
      className="tol-button-dropdown"
      trigger={toggle.disabled ? [] : ["click"]}
      placement={placement}
      renderToggle={renderButton}
    >
      {buttons.map((button: PButton, index) =>
        (button.visible !== false) ? (
          <Dropdown.Item
            key={index}
            onClick={button.onClick}
            disabled={button.disabled}
          >
            <Icon
              icon={button.icon}
              className="tol-dropdown-icon"
            />
            {button.text}
          </Dropdown.Item>
        ) : null
      )}
    </Dropdown>
  );
}
