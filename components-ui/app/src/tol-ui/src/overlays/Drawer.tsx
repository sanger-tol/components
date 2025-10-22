/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Drawer as RSDrawer } from "rsuite";
import { Button, PButton, TDrawerPlacement } from "..";
import { ReactNode } from "react";


export interface PDrawer {
  children?: ReactNode;
  open: boolean;
  setOpen: any;
  placement?: TDrawerPlacement;
  title: string;
  onSave?: () => void;
  onDiscard?: () => void;
  onClose?: () => void;
  pendingChanges?: boolean;
  actionButtons?: PButton[];
}

export function Drawer(props: PDrawer) {
  const {
    children,
    open,
    setOpen,
    placement = "right",
    title,
    onSave,
    onDiscard,
    onClose = () => setOpen(false),
    pendingChanges = false,
    actionButtons = [],
  } = props;
  const { Header, Body, Footer } = RSDrawer;

  return (
    <RSDrawer
      backdrop={pendingChanges ? "static" : true}
      placement={placement}
      open={open}
      onClose={onClose}
    >
      <Header>
        <h5 style={{ margin: 4 }}>{title}</h5>
        <Button
          onClick={onClose}
          className="close-button"
          type="error"
          icon="xmark"
        />
      </Header>
      <Body>{children}</Body>
      <Footer>
        {onSave &&
          <Button
            text="Save & Close"
            type="success"
            position="right"
            disabled={!pendingChanges}
            onClick={onSave}
          />
        }
        {onDiscard &&
          <Button
            text="Discard & Close"
            type="error"
            position="right"
            disabled={!pendingChanges}
            onClick={onDiscard}
          />
        }
        {actionButtons && actionButtons.map((btn, index) => (
          <Button
            key={index}
            {...btn}
          />
        ))}
      </Footer>
    </RSDrawer>
  );
}
