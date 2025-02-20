/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Drawer as RSDrawer } from "rsuite";
import { Button } from "..";

interface Props {
  open: boolean;
  setOpen: any;
  placement?: "top" | "bottom" | "left" | "right";
  title: string;
  children?: any;
  onClose?: () => void;
}

function Drawer(props: Props) {
  const { open, setOpen, title, children, onClose } = props;
  const placement = props.placement ?? "right";
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

export default Drawer;
