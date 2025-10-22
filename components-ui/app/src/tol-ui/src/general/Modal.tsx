/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal as RSModal } from "rsuite";
import { Button } from "..";

export interface PModal {
  size?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: JSX.Element | JSX.Element[];
  header?: JSX.Element;
  overflow?: boolean;
  closeButton?: boolean;
  actionButton?: JSX.Element;
  className?: string;
  pendingChanges?: boolean;
  onClose?: () => void;
  onEnter?: () => void;
  onExited?: () => void;
}

export function Modal(props: PModal) {
  const {
    size = "md",
    open,
    setOpen,
    children,
    header,
    closeButton = true,
    overflow = true,
    actionButton,
    className,
    pendingChanges = false,
    onClose, 
    onEnter,
    onExited
  } = props;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* @ts-ignore */}
      <RSModal
        overflow={overflow}
        open={open}
        onClose={onClose || handleClose}
        /* @ts-ignore */
        size={size}
        className={className}
        onEnter={onEnter}
        onExited={onExited}
        backdrop={pendingChanges ? "static" : true}
      >
        <RSModal.Header closeButton={false}>{header}</RSModal.Header>
        <RSModal.Body>{children}</RSModal.Body>
        <RSModal.Footer>
          {actionButton && (
            <span style={{ margin: "6px" }}>{actionButton}</span>
          )}
          {closeButton && (
            <Button
              type="error"
              onClick={handleClose}
              icon="xmark"
              position="right"
            />
          )}
        </RSModal.Footer>
      </RSModal>
    </>
  );
}
