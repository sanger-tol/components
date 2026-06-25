/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARD_ENTITIES,
  BOARD_MESSAGE_TEXT,
  EditableTitle,
  BOARD_BUTTONS,
} from "../../../..";
import type { ITab, PButton } from "../../../..";


export interface IViewTabBuilder {
  /**
   * Unique ID for the view.
   */
  viewId: string;
  /**
   * Title of the view.
   */
  viewTitle: string;
  /**
   * If the view is currently selected.
   */
  active: boolean;
  /**
   * Whether the board is in edit mode.
   */
  editMode: boolean;
  /**
   * True if there is more than one view.
   */
  isMoreThanOneView: boolean;
  /**
   * Handler to open the delete view modal.
   */
  onOpenDeleteViewModal: () => void;
  /**
   * Handler for clicking the view tab.
   */
  onClickView: (viewId: string) => () => void;
  /**
   * Handler for saving the view title.
   */
  onSaveTitle: (viewId: string, newTitle: string) => void;
}

/**
 * Builds the tabs for each view in the board.
 */
export function viewTabBuilder({
  viewId,
  viewTitle,
  active,
  editMode,
  isMoreThanOneView,
  onOpenDeleteViewModal,
  onClickView,
  onSaveTitle,
}: IViewTabBuilder): ITab {
  const Title = (
    <EditableTitle
      hideButtons
      text={viewTitle}
      editable={editMode && active}
      onSave={(newTitle: string) => onSaveTitle(viewId, newTitle)}
      emptyAllowed={false}
      onEmptyMessage={
        BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.VIEW).MISC.EMPTY_TITLE_ERROR
      }
    />
  );

  const viewTab: PButton = {
    ...BOARD_BUTTONS.VIEW_TAB,
    id: viewId,
    text: Title,
    onClick: onClickView(viewId),
    visible: isMoreThanOneView,
    /**
     * Buttons cannot have inputs as children.
     * When editable, the tab needs to be a div to allow
     * the EditableTitle input to be the correct DOM structure.
     */
    as: editMode ? "div" : "button",
  };

  const deleteViewButton: PButton = {
    ...BOARD_BUTTONS.DELETE_VIEW,
    onClick: onOpenDeleteViewModal,
    visible: editMode && active && isMoreThanOneView,
  };

  return {
    buttons: [viewTab, deleteViewButton],
  };
}
