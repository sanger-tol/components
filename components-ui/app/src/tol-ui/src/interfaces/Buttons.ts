/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export interface IDropdownButtonConfig {
  name: string;
  icon?: string;
  disabled?: boolean;
  /**
   * Optional predicate: returns true if the action should be shown
   * for the currently selected rows. Mainly used with DropdownButtons.
   */
  isVisibleAction?: (...args: any[]) => boolean;
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
  text?: string;
}