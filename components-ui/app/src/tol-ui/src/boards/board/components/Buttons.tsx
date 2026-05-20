/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BUTTONS } from "../../../config/buttons.config";
import {
  BOARD_MESSAGE_TEXT,
  BOARDS,
  Button,
  copyToClipboard,
  MAX_VIEWS_ALLOWED_MESSAGE,
} from "../../..";
import type { PButton } from "../../..";


const editOrExitLogic = (editMode: boolean): PButton => {
  return editMode
    ? {
        ...BUTTONS.CONFIRM,
        type: "primary",
        text: "Exit Edit Mode",
      }
    : {
        ...BUTTONS.EDIT,
        text: "Edit",
      };
};

const layoutOrExitLogic = (layoutMode: boolean): PButton => {
  return layoutMode
    ? {
        ...BUTTONS.SAVE,
        text: "Save Layouts",
      }
    : {
        ...BUTTONS.EDIT,
        text: "Change Layout",
      };
};

export const copyViewIdToClipboard = (
  viewId: string,
  visible: boolean,
): PButton => ({
  ...BUTTONS.COPY,
  onClick: () => {
    copyToClipboard(
      viewId,
      BOARD_MESSAGE_TEXT(BOARDS.VIEW).CLIPBOARD_COPY.ID_COPY,
    );
  },
  position: "left",
  tooltip: "Copy View ID",
  outline: false,
  visible: visible,
  testid: "copy-view-id-button",
  className: "tol-copy-view-id-button",
});

export const addZoneButton = (
  onClick: () => void,
  visible: boolean,
): PButton => ({
  ...BUTTONS.ADD,
  testid: "open-add-zone-modal-button",
  visible: visible,
  onClick: onClick,
  tooltip: "",
  text: "Add Zone",
  icon: "object-group",
});

export const copyBoardButton = (onClick: () => void): PButton => ({
  ...BUTTONS.COPY,
  onClick: onClick,
  tooltip: "Copy Board",
  testid: "copy-board-button",
});

export const shareButton: PButton = {
  ...BUTTONS.SHARE,
  testid: "share-board-button",
  onClick: () => {
    copyToClipboard(
      window.location.href,
      BOARD_MESSAGE_TEXT(BOARDS.BOARD).CLIPBOARD_COPY.URL_COPY,
    );
  },
};

export const deleteViewButton = (
  onClick: () => void,
  visible: boolean,
): PButton => ({
  ...BUTTONS.DISCARD,
  onClick: onClick,
  testid: "delete-view-button",
  position: "left",
  tooltip: "Delete View",
  outline: false,
  visible: visible,
});

export const viewSelectorTab = (
  viewId: string,
  viewTitle: string,
  onClick: () => void,
  visible: boolean,
): PButton => ({
  id: viewId,
  text: viewTitle,
  onClick: onClick,
  className: "tol-view-tab",
  position: "left",
  visible: visible,
  testid: "tab-view-selector-button",
});

export const layoutOrExitButton = (
  layoutMode: boolean,
  visible: boolean,
  onClick: () => void,
): PButton => ({
  ...layoutOrExitLogic(layoutMode),
  visible: visible,
  onClick: onClick,
  testid: "board-layout-mode-button",
  tooltip: "",
});

export const editOrExitButton = (
  editMode: boolean,
  visible: boolean,
  disabled: boolean,
  tableLoading: boolean,
  onClick: () => void,
): PButton => ({
  ...editOrExitLogic(editMode),
  visible: visible,
  disabled: disabled,
  onClick: onClick,
  testid: `board-${editMode ? "exit" : "enter"}-edit-mode-button`,
  tooltip:
    editMode && tableLoading
      ? "Please wait for the table to load before exiting edit mode."
      : "",
});

export const addViewButton = (
  visible: boolean,
  onClick: () => void,
  disabled: boolean,
) => (
  <Button
    {...BUTTONS.ADD}
    text="New View"
    visible={visible}
    onClick={onClick}
    icon="pager"
    testid="board-add-view-button"
    position="left"
    disabled={disabled}
    disabledTooltip={MAX_VIEWS_ALLOWED_MESSAGE}
  />
);

export const importViewButton = (
  visible: boolean,
  onClick: () => void,
  disabled: boolean,
) => (
  <Button
    {...BUTTONS.ADD}
    text="Import View"
    tooltip="Import a view from another board using its View ID"
    visible={visible}
    onClick={onClick}
    icon="file-import"
    testid="board-import-view-button"
    position="left"
    disabled={disabled}
    disabledTooltip={MAX_VIEWS_ALLOWED_MESSAGE}
  />
);
