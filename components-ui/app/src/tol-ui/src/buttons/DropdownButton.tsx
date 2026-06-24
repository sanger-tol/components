/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Dropdown } from "rsuite";
import { Button, Icon, getButtonWrapperClass } from "..";
import type { PButton } from "..";
import type { DropdownProps } from "rsuite";


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
  placement?: DropdownProps["placement"];
}

/**
 * Renders a dropdown button using rsuite's Dropdown component
 * and the PButton interface.
 */
export function DropdownButton(props: PDropdownButton) {
  const { toggle, buttons } = props;
  const { position = "none", ...toggleWithoutPosition } = toggle;

  const placement: DropdownProps["placement"] =
    props.placement || (
      position === "right"
        ? "bottomEnd"
        : "bottomStart"
    );


  const renderButton = (propsToggle: any, ref: React.Ref<HTMLButtonElement>) => {
    const { disabled, ...restToggle } = propsToggle;
    return <Button ref={ref} {...toggleWithoutPosition} {...restToggle} position="none" />;
  };

  const wrapperClass = getButtonWrapperClass(position);
  const dropdownClass = ["tol-button-dropdown", wrapperClass].filter(Boolean).join(" ");

  return (
    <Dropdown
      className={dropdownClass}
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
            {button.icon && (
              <Icon
                icon={button.icon}
                className="tol-dropdown-icon"
              />
            )}
            {button.text &&
              <span className="tol-dropdown-text">
                {button.text}
              </span>
            }
          </Dropdown.Item>
        ) : null
      )}
    </Dropdown>
  );
}
