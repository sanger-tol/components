/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARD_ENTITIES,
  BOARD_MESSAGE_TEXT,
  DropdownButton,
  MAX_VIEWS_ALLOWED,
  PButton,
  SortableTabs,
  useBoard,
} from "../../..";
import { BOARD_BUTTONS } from "../../../config/boards.config";
import { viewTabBuilder } from ".";


export interface PViewTabs {
  /**
   * ID of the currently active view.
   */
  activeViewId: string | null;
  /**
   * Opens the delete view modal.
   */
  onOpenDeleteViewModal: () => void;
  /**
   * Opens the view import modal.
   */
  onOpenViewImportModal: () => void;
  /**
   * Handles clicking a view tab.
   */
  onClickView: (viewId: string) => () => void;
  /**
   * Adds a new view.
   */
  onAddView: () => void;
  /**
   * Handles reordering views.
   */
  onReorderView: (reorderedIds: string[]) => void;
  /**
   * Handles saving a view title.
   */
  onSaveTitle: (viewId: string, newTitle: string) => void;
}

/**
 * Renders the tabs for board views, including add/import buttons.
 */
export function ViewTabs(props: PViewTabs) {
  const {
    activeViewId,
    onOpenDeleteViewModal,
    onOpenViewImportModal,
    onClickView,
    onAddView,
    onReorderView,
    onSaveTitle,
  } = props;

  const { board, editMode } = useBoard();

  const isMaxViews = (board?.order?.length ?? 0) >= MAX_VIEWS_ALLOWED;
  const isMoreThanOneView = (board?.order?.length ?? 0) > 1;

  const addView: PButton = {
    ...BOARD_BUTTONS.ADD_VIEW,
    visible: editMode,
    disabled: isMaxViews,
  };

  const newView: PButton = {
    ...BOARD_BUTTONS.NEW_VIEW,
    onClick: onAddView,
    disabledTooltip:
      BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.BOARD).CREATE.MAX_LIMIT_ERROR,
    visible: editMode,
  };

  const importView: PButton = {
    ...BOARD_BUTTONS.IMPORT_VIEW,
    onClick: onOpenViewImportModal,
    disabledTooltip:
      BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.BOARD).CREATE.MAX_LIMIT_ERROR,
  };

  return (
    <>
      <DropdownButton
        toggle={addView}
        buttons={[newView, importView]}
      />
      <SortableTabs
        activeId={activeViewId!}
        className="tol-views-nav"
        onReorder={editMode ? onReorderView : undefined}
        tabs={
          isMoreThanOneView
            ? board?.order?.map((viewId) => {
              const view = board?.children?.[viewId];
              return viewTabBuilder({
                viewId,
                viewTitle: view?.title!,
                active: viewId === activeViewId,
                editMode,
                isMoreThanOneView,
                onOpenDeleteViewModal,
                onClickView,
                onSaveTitle,
              });
            })
            : undefined
        }
      />
    </>
  );
}