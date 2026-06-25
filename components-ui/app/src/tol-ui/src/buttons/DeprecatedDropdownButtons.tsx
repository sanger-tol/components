/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */


import { Dropdown } from "rsuite";
import { IDropdownButtonConfig, IDropdownMainIconProps } from "../interfaces";
import { Button } from "../index";
import type { DropdownProps } from "rsuite";


export interface PDeprecatedDropdownButtons {
  mainButtonIcon: IDropdownMainIconProps;
  placement?: DropdownProps["placement"];
  menuStyle?: object;
  disabled?: boolean;

  dropdownButtons: IDropdownButtonConfig[] | any;
  header?: IDropdownButtonConfig | any;
  footer?: IDropdownButtonConfig | any;
}

export function DeprecatedDropdownButtons(props: PDeprecatedDropdownButtons) {
  const {
    mainButtonIcon,
    placement,
    menuStyle,
    disabled,
    dropdownButtons,
    header,
    footer,
  } = props;

  const RenderButton = (props: any, ref: any) => (
    <Button
      ref={ref}
      {...props}
      {...mainButtonIcon}
    />
  );

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
