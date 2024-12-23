/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Drawer as RSDrawer } from 'rsuite';
import { Button } from '..';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface Props {
  open: boolean,
  setOpen: any,
  placement?: 'top' | 'bottom' | 'left' | 'right',
  title: string,
  children?: any
}


function Drawer(props: Props) {
  const { open, setOpen, title, children } = props;
  const placement = props.placement ?? "right"
  const { Header, Body } = RSDrawer;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <RSDrawer placement={placement} open={open} onClose={() => setOpen(false)}>
    <Header>
      <h5 style={{margin: 4}}>{title}</h5>
      <Button
        onClick={handleClose}
        className="close-button"
        variant="danger"
      >
        <FontAwesomeIcon icon={faXmark} size="sm" />
      </Button>
    </Header>
    <Body>
      {children}
    </Body>
  </RSDrawer>
  );
}

export default Drawer;