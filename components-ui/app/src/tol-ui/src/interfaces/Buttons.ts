/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IDropdownButtonConfig {
  name: string;
  icon?: string;
  disabled?: boolean;
  action: (...args: any[]) => void;
}

export interface IDropdownMainIconProps {
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