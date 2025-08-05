/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

//@ts-nocheck

import React from "react";
import { Dropdown } from "rsuite";
import { IDropdownButtonConfig, IDropdownMainIconProps } from "../interfaces";
import { Toaster, Message, Button } from "../index";

export interface PDropdownButtons {
  mainButtonIcon: IDropdownMainIconProps;
  placement?: string;
  menuStyle?: object;
  disabled?: boolean;
  showMessages?: boolean;

  dropdownButtons: IDropdownButtonConfig[] | any;
  header?: IDropdownButtonConfig | any;
  footer?: IDropdownButtonConfig | any;
}

export function DropdownButtons(props: PDropdownButtons) {
  const {
    mainButtonIcon,
    placement,
    menuStyle,
    disabled,
    showMessages,
    dropdownButtons,
    header,
    footer,
  } = props;

  const toaster = Toaster();

  const pushMessage = (message: string, type: string = "info") => {
    toaster.push(<Message children={message} type={type} showIcon={true} />, {
      duration: 4000,
      placement: "bottomEnd",
    });
  };

  const pushSuccess = (actionName: string) =>
    pushMessage(`Action "${actionName}" dispatched successfully.`);

  const pushFailure = (actionName: string) =>
    pushMessage(`Action "${actionName}" failed.`, "error");

  // shouldn't do this at this level
  const wrapAction = (action: IDropdownButtonConfig) => {
    const name = action.name;

    return async (...args) => {
      try {
        await action.action(...args);
        showMessages ?? pushSuccess(name);
      } catch (e: any) {
        showMessages ?? pushFailure(name);
        console.error(e);
      }
    };
  };

  const RenderButton = (props: any, ref: any) => {
    return (
      <Button
        {...props}
        type={mainButtonIcon.type}
        className={mainButtonIcon.className}
        disabled={mainButtonIcon.disabled}
        icon={mainButtonIcon.icon}
        position={mainButtonIcon.position}
        outline={mainButtonIcon.outline}
        tooltip={mainButtonIcon.tooltip}
        id={mainButtonIcon.id}
      />
    );
  };

  return (
    <Dropdown
      renderToggle={RenderButton}
      placement={placement}
      menuStyle={menuStyle}
      disabled={disabled}
    >
      {header && (
        <>
          <Dropdown.Item
            key="header"
            onClick={header.action}
            disabled={header.disabled}
            icon={header.icon}
          >
            {header.name}
          </Dropdown.Item>
          <Dropdown.Separator />
        </>
      )}
      {dropdownButtons.map((button, index) => (
        <Dropdown.Item
          key={index}
          onClick={button.action}
          disabled={button.disabled}
          icon={button.icon}
        >
          {button.name}
        </Dropdown.Item>
      ))}
      {footer && (
        <>
          <Dropdown.Separator />
          <Dropdown.Item
            key="footer"
            onClick={footer.action}
            disabled={footer.disabled}
            icon={footer.icon}
          >
            {footer.name}
          </Dropdown.Item>
        </>
      )}
    </Dropdown>
  );
}
