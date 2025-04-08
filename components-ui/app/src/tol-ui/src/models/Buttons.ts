/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IButton {
  icon?: string;
  onClick?: () => void;
  className?: string;
  text?: string;
  disabled?: boolean;
  size?: "md" | "lg";
  type?: string;
  active?: boolean;
  position?: "left" | "right";
  tooltip?: string;
  disabledTooltip?: string;
  loading?: boolean;
  outline?: boolean;
  id?: string;
  visible?: boolean;
}

export interface HeaderButton {
  href: string;
  text: string;
}

export interface IDropdownButtonProps {
  name: string;
  icon?: string;
  disabled?: boolean;
  action: (...args: any[]) => void;
}

interface IDropdownMainIconProps {
  icon: string;
  id?: string;
  type?: string;
  style?: object;
  className?: string;
  disabled?: boolean;
  position?: string;
  outline?: boolean;
  tooltip?: string;
}

export interface IDropdownButtons {
  mainButtonIcon: IDropdownMainIconProps;
  placement?: string;
  menuStyle?: object;
  disabled?: boolean;
  showMessages?: boolean;

  dropdownButtons: IDropdownButtonProps[] | any;
  header?: IDropdownButtonProps | any;
  footer?: IDropdownButtonProps | any;
}
  