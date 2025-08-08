/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Drawer as RSDrawer } from "rsuite";
import { Button, TDrawerPlacement } from "..";

export interface PDrawer {
  open: boolean;
  setOpen: any;
  placement?: TDrawerPlacement;
  title: string;
  children?: any;
  onClose?: () => void;
}

export function Drawer(props: PDrawer) {
  const {
    open,
    setOpen,
    placement = "right",
    title,
    children,
    onClose,
  } = props;
  const { Header, Body } = RSDrawer;

  const handleClose = () => {
    onClose ? onClose() : setOpen(false);
  };

  return (
    <RSDrawer placement={placement} open={open} onClose={handleClose}>
      <Header>
        <h5 style={{ margin: 4 }}>{title}</h5>
        <Button
          onClick={handleClose}
          className="close-button"
          type="error"
          icon="xmark"
        />
      </Header>
      <Body>{children}</Body>
    </RSDrawer>
  );
}
