/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from "..";
import { Modal as RSModal } from "rsuite";

export interface Props {
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
}

const Modal = (props: Props) => {
  const { size, open, setOpen, children, header, actionButton, className, onEnter } =
    props;
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
};

export default Modal;
