/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Modal as RSModal } from "rsuite";
import { Button } from "..";

interface PModal {
  size: string;
  open: boolean;
  setOpen: any;
  children?: JSX.Element | JSX.Element[];
  header?: JSX.Element;
  overflow?: boolean;
  closeButton?: boolean;
  actionButton?: JSX.Element;
  className?: string;
  onEnter?: () => void;
  onExited?: () => void;
}

export function Modal(props: PModal) {
  const {
    size,
    open,
    setOpen,
    children,
    header,
    actionButton,
    className,
    onEnter,
    onExited,
  } = props;
  const closeButton = props.closeButton ?? true;
  const rsOverflow = props.overflow !== false;
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* @ts-ignore */}
      <RSModal
        overflow={rsOverflow}
        open={open}
        onClose={handleClose}
        /* @ts-ignore */
        size={size}
        className={className}
        onEnter={onEnter}
        onExited={onExited}
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
