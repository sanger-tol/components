/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal as RSModal } from "rsuite";
import { Button, BUTTONS } from "..";

export interface PModal {
  size?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: JSX.Element | JSX.Element[];
  header?: JSX.Element;
  overflow?: boolean;
  closeButton?: boolean;
  actionButton?: JSX.Element;
  actionButtonInline?: boolean;
  className?: string;
  hasPendingChanges?: boolean;
  onClose?: () => void;
  onEnter?: () => void;
  onExited?: () => void;
  onOpen?: () => void;
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
    actionButtonInline = false,
    className,
    hasPendingChanges = false,
    onClose,
    onEnter,
    onExited,
    onOpen,
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
        onOpen={onOpen}
        className={className}
        onEnter={onEnter}
        onExited={onExited}
        backdrop={hasPendingChanges ? "static" : true}
      >
        <RSModal.Header closeButton={false}>{header}</RSModal.Header>
        <RSModal.Body>{children}</RSModal.Body>
        <RSModal.Footer>
          <div
            className={
              actionButtonInline ? "tol-modal-inline-action-button" : ""
            }
          >
            {actionButton && (
              <span
                className={!actionButtonInline ? "tol-modal-action-button" : ""}
              >
                {actionButton}
              </span>
            )}
            {closeButton && <Button {...BUTTONS.CLOSE} onClick={handleClose} />}
          </div>
        </RSModal.Footer>
      </RSModal>
    </>
  );
}
