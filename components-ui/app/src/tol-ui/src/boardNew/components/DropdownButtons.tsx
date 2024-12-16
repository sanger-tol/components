/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import React from "react";
import { Button, Dropdown } from "rsuite";

export interface DropdownButtonProps {
  dropdownButtonName: string;
  dropdownButtonIcon?: string;
  disabled?: boolean;
  action: () => void;
}

export interface DropdownMainIconProps {
  mainIcon: React.ReactNode;
  variant?: string;
  style?: object;
}

interface Props {
  mainButtonIcon: DropdownMainIconProps;
  placement?: string;
  menuStyle?: object;
  globalDisabled?: boolean;
  dropdownButtons: DropdownButtonProps[] | DropdownButtonProps;
}

function DropdownButtons(props: Props) {
  const {
    mainButtonIcon,
    placement,
    menuStyle,
    globalDisabled,
    dropdownButtons,
  } = props;

  const renderButton = (props: any, ref: any) => {
    return (
      <Button
        {...props}
        ref={ref}
        variant={mainButtonIcon.variant}
        style={mainButtonIcon.style}
      >
        {mainButtonIcon.mainIcon}
      </Button>
    );
  };

  return (
    <Dropdown
      renderToggle={renderButton}
      placement={placement}
      menuStyle={menuStyle}
      disabled={globalDisabled}
    >
      {dropdownButtons.map((button, index) => (
        <Dropdown.Item
          key={index}
          onClick={button.action}
          disabled={button.disabled}
        >
          {button.dropdownButtonName}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
}

export default DropdownButtons;
