/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Drawer as RSDrawer } from "rsuite";
import {
  AreYouSureModal,
  Button,
  buttons,
  PButton,
  TDrawerPlacement,
} from "..";
import { ReactNode, useState } from "react";


export interface PDrawer {
  children?: ReactNode;
  open: boolean;
  setOpen: any;
  placement?: TDrawerPlacement;
  title: string;
  onSave?: () => void;
  onDiscard?: () => void;
  onClose?: () => void;
  hasPendingChanges?: boolean;
  actionButtons?: PButton[];
}

export function Drawer(props: PDrawer) {
  const {
    children,
    open,
    setOpen,
    placement = "right",
    title,
    hasPendingChanges = false,
    actionButtons = [],
  } = props;
  const { Header, Body, Footer } = RSDrawer;
  const [openSaveModal, setOpenSaveModal] = useState<boolean>(false);

  const onSave = () => {
    setOpenSaveModal(false);
    setOpen(false);
    props.onSave && props.onSave();
  }

  const onDiscard = () => {
    setOpenSaveModal(false);
    setOpen(false);
    props.onDiscard && props.onDiscard();
  };

  const onClose = () => {
    if (hasPendingChanges) {
      setOpenSaveModal(true);
    } else {
      setOpen(false);
    }
    props.onClose && props.onClose();
  };

  return (
    <>
      <RSDrawer
        className="tol-drawer"
        placement={placement}
        open={open}
        onClose={onClose}
      >
        <Header>
          <h5 className="tol-drawer-title">
            {title}
          </h5>
          <Button
            {...buttons.close}
            position="right"
            onClick={onClose}
          />
        </Header>
        <Body>{children}</Body>
        <Footer>
          {onSave &&
            <Button
              {...buttons.save}
              position="right"
              disabled={!hasPendingChanges}
              onClick={onSave}
            />
          }
          {onDiscard &&
            <Button
              {...buttons.discard}
              position="right"
              disabled={!hasPendingChanges}
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
      <AreYouSureModal
        open={openSaveModal}
        setOpen={setOpenSaveModal}
        onSave={onSave}
        onDiscard={onDiscard}
      />
    </>
  );
}
