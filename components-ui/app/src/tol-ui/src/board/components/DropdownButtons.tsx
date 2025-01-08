/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

//@ts-nocheck

import React from "react";
import { Button, Dropdown } from "rsuite";

import { Toaster, Message } from '../../index';

export interface DropdownButtonProps {
  dropdownButtonName: string;
  dropdownButtonIcon?: string;
  disabled?: boolean;
  icon?: Element;
  action: (...args: any[]) => void;
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
  showMessages?: boolean;
}

function DropdownButtons(props: Props) {
  const {
    mainButtonIcon,
    placement,
    menuStyle,
    globalDisabled,
    dropdownButtons,
    showMessages
  } = props;

  const toaster = Toaster();

  const pushMessage = (message: string, type: string = 'info') => {
    toaster.push(
      <Message
        children={message}
        type={type}
        showIcon={true}
      />,
      { duration: 4000 }
    );
  };

  const pushSuccess = (actionName: string) => pushMessage(
    `Action "${actionName}" dispatched successfully.`
  );

  const pushFailure = (actionName: string) => pushMessage(
    `Action "${actionName}" failed.`,
    'error'
  );

  const wrapAction = (action: DropdownButtonProps) => {
    const name = action.dropdownButtonName;
    const fn = action.action;

    return async (...args) => {
      try {
        await fn(...args);
        showMessages ?? pushSuccess(name);
      } catch (e: any) {
        showMessages ?? pushFailure(name);
        console.error(e);
      }
    }
  }

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
          onClick={wrapAction(button)}
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
