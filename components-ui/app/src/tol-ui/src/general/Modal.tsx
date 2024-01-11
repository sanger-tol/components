/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from 'react-bootstrap';
import { Modal as RSModal } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


export interface Props {
  size: string,
  open: boolean,
  setOpen: Function, // eslint-disable-line
  children: JSX.Element | JSX.Element[],
  overflow?: boolean,
  actionButton?: JSX.Element,
}

const Modal = (props: Props) => {
  const {size, open, setOpen, children, overflow, actionButton} = props;
  const handleClose = () => {
    setOpen(false);
  };

  let rsOverflow = true;
  if (overflow === false) rsOverflow = false;

  return (
    <>
      {/* @ts-ignore */}
      <RSModal overflow={rsOverflow} open={open} onClose={handleClose} size={size}>
        <RSModal.Body>
          {children}
        </RSModal.Body>
        <RSModal.Footer>
          <Button variant="danger" onClick={handleClose}>
            <FontAwesomeIcon icon={faXmark} size="sm" />
          </Button>
          {actionButton &&
            <span style={{margin: "6px"}}>
              {actionButton}
            </span>
          }
        </RSModal.Footer>
      </RSModal>
    </>
  );
};

export default Modal;
