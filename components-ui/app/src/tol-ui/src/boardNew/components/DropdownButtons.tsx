/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

//@ts-nocheck

import React from "react";
import { Button, Dropdown } from "rsuite";

export interface DropdownButtonProps {
  dropdownButtonName: string;
  dropdownButtonIcon?: string;
  disabled?: boolean;
  icon?: Element;
  action: (context?: Record<string, any>) => void;
  context?: Record<string, any>;
}

export interface DropdownMainIconProps {
  mainIcon: React.ReactNode;
  variant?: string;
  style?: object;
  className?: string;
  disabled?: boolean;
}

interface Props {
  mainButtonIcon: DropdownMainIconProps;
  placement?: string;
  menuStyle?: object;
  globalDisabled?: boolean;
  dropdownButtons: DropdownButtonProps[] | any;
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
        appearance={mainButtonIcon.variant}
        style={mainButtonIcon.style}
        className={mainButtonIcon.className}
        disabled={mainButtonIcon.disabled}
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
          onClick={() => button.action(button.context)}
          disabled={button.disabled}
          icon={button.icon}
        >
          {button.dropdownButtonName}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
}

export default DropdownButtons;
