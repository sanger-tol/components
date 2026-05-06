/*
 * SPDX-FileCopyrightText: 2026 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Input } from "rsuite";
import { Button, BUTTONS, Modal } from "..";

export interface PNewTitleModal {
  open: boolean;
  setOpen: (open: boolean) => void;
  confirmationAction: () => void;
  title: string;
  setTitle: (title: string) => void;
  itemType?: string;
  onExited?: () => void;
  userInfoHelp?: JSX.Element | string;
}

export function NewTitleModal(props: PNewTitleModal) {
  const {
    open,
    setOpen,
    confirmationAction,
    title,
    setTitle,
    itemType,
    onExited,
    userInfoHelp,
  } = props;
  return (
    <Modal
      open={open}
      setOpen={setOpen}
      size="xs"
      actionButtonInline
      onExited={onExited}
      children={
        <>
          {userInfoHelp}
          <Input
            value={title}
            onChange={setTitle}
            placeholder={`Enter new ${itemType} title`}
          />
        </>
      }
      actionButton={
        <Button
          {...BUTTONS.CONFIRM}
          disabledTooltip={"Please enter a title before saving."}
          disabled={!title.trim()}
          onClick={async () => await confirmationAction()}
        />
      }
    />
  );
}
