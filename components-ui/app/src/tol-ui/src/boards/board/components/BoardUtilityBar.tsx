/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Avatar } from "rsuite";
import {
  upsertTitle,
  useBoard,
  UtilityBar,
  TsDataSource,
  BOARD_BUTTONS,
  BOARD_MESSAGE_TEXT,
  BOARD_ENTITIES,
  HoverOverlay,
} from "../../..";
import { boardButtonsBuilder, ViewModeBoardTitle, ViewTabs } from ".";
import type { PEditableTitle, PButton } from "../../..";

export interface IBoardUtilityBar {
  /**
   * ID of the currently active view.
   */
  activeViewId: string | null;
  /**
   * DataSource for performing board operations.
   */
  boardDataSource: TsDataSource;
  /**
   * Title for the new board copy.
   */
  newBoardCopyTitle: string;
  /**
   * Opens the board copy modal.
   */
  onOpenBoardCopyModal: () => void;
  /**
   * Sets the new board copy title.
   */
  setNewBoardCopyTitle: (title: string) => void;
  /**
   * Opens the add zone modal.
   */
  onOpenAddZone: () => void;
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
   * Opens the delete view modal.
   */
  onOpenDeleteViewModal: () => void;
  /**
   * Opens the view import modal.
   */
  onOpenViewImportModal: () => void;
}

/**
 * Wrapper of the UtilityBar component that contains board-level
 * buttons, titles and the view tabs.
 */
export function BoardUtilityBar(props: IBoardUtilityBar) {
  const {
    activeViewId,
    boardDataSource,
    newBoardCopyTitle,
    onOpenBoardCopyModal,
    setNewBoardCopyTitle,
    onOpenAddZone,
  } = props;

  const {
    privilege,
    editMode,
    setEditMode,
    tableLoading,
    layoutMode,
    setLayoutMode,
    board,
    setBoard,
  } = useBoard();

  const onSaveBoardTitle = (newTitle: string) => {
    upsertTitle(newTitle, board.id!, boardDataSource);
    setBoard({ ...board, title: newTitle });
  };

  const onSaveViewTitle = (viewId: string, newTitle: string) => {
    upsertTitle(newTitle, viewId, boardDataSource);
    setBoard({
      ...board,
      children: {
        ...board?.children,
        [viewId]: {
          ...board?.children?.[viewId],
          title: newTitle,
        },
      },
    });
  };

  const boardUtilityBarButtons = boardButtonsBuilder({
    activeViewId,
    privilege,
    editMode,
    setEditMode,
    layoutMode,
    setLayoutMode,
    tableLoading,
    boardTitle: board?.title!,
    newBoardCopyTitle,
    setNewBoardCopyTitle,
    onOpenBoardCopyModal,
  });

  const addZone: PButton = {
    ...BOARD_BUTTONS.ADD_ZONE,
    onClick: onOpenAddZone,
    visible: editMode && !layoutMode,
  };

  const editModeBoardTitle: PEditableTitle = {
    text: board?.title!,
    editable: true,
    onSave: onSaveBoardTitle,
    hideButtons: true,
    emptyAllowed: false,
    onEmptyMessage: BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.BOARD).MISC
      .EMPTY_TITLE_ERROR,
  };

  const ViewModeTitle = (
    <ViewModeBoardTitle text={board?.title!} editable={editMode} />
  );

  return (
    <div className="tol-board-bar">
      <div className="tol-board-bar-container">
        <div className="tol-board-bar-inner-container">
          <UtilityBar
            id="tol-board-utility-bar"
            buttons={boardUtilityBarButtons}
            /**
             * Display a larger title in view mode, and an editable title in edit mode.
             */
            title={editMode ? editModeBoardTitle : undefined}
            elements={editMode ? undefined : [ViewModeTitle]}
          />
        </div>
        {!board.write_privilege && (
          <HoverOverlay
            children={
              <Avatar
                circle
                size="sm"
                className="tol-board-bar-profile-bubble"
              >
                {board?.order
                  ? `${board.owner_email?.split("@")[0].replace(/\d/g, "")}`
                  : "..."}
              </Avatar>
            }
            contents={`Board owner: ${board.owner_email}`}
            placement="left"
          />
        )}
      </div>
      {(board?.order?.length > 1 || editMode) && (
        <UtilityBar
          id="tol-board-views-utility-bar"
          className="tol-views-bar"
          elements={[<ViewTabs onSaveTitle={onSaveViewTitle} {...props} />]}
          buttons={[addZone]}
        />
      )}
    </div>
  );
}
