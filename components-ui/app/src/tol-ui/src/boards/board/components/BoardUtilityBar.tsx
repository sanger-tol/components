/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef } from "react";
import {
  upsertTitle,
  useBoard,
  UtilityBar,
  TsDataSource,
  BOARD_BUTTONS,
  BOARD_MESSAGE_TEXT,
  BOARD_ENTITIES,
  HoverOverlay,
  ProfileAvatar,
  resetAllBoardFilters,
  PopUpMessage,
  isBoardInNavConfig,
  useApp,
  useAuth,
  Header,
  useStickyShadow,
  Button,
} from "../../..";
import { boardButtonsBuilder, ViewModeBoardTitle, ViewTabs } from ".";
import type { PEditableTitle, PButton } from "../../..";

/** Props for the BoardUtilityBar component. */
export interface IBoardUtilityBar {
  /** ID of the currently active view. */
  activeViewId: string | null;
  /** Data source for performing board operations. */
  boardDataSource: TsDataSource;
  /** Title for the new board copy. */
  newBoardCopyTitle: string;
  /** Opens the board copy modal. */
  onOpenBoardCopyModal: () => void;
  /** Sets the new board copy title. */
  setNewBoardCopyTitle: (title: string) => void;
  /** Opens the add zone modal. */
  onOpenAddZone: () => void;
  /** Handles clicking a view tab. */
  onClickView: (viewId: string) => () => void;
  /** Adds a new view. */
  onAddView: () => void;
  /** Handles reordering views. */
  onReorderView: (reorderedIds: string[]) => void;
  /** Opens the delete view modal. */
  onOpenDeleteViewModal: () => void;
  /** Opens the view import modal. */
  onOpenViewImportModal: () => void;
  /** Opens the board configuration drawer. */
  onOpenBoardConfigDrawer: () => void;
}

/** Wraps the board-level buttons, titles, and view tabs. */
export function BoardUtilityBar(props: IBoardUtilityBar) {
  const {
    activeViewId,
    boardDataSource,
    newBoardCopyTitle,
    onOpenBoardCopyModal,
    setNewBoardCopyTitle,
    onOpenAddZone,
    onOpenBoardConfigDrawer,
  } = props;

  const { navConfig } = useApp();
  const { user } = useAuth();
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
  const {
    allowBoardCopy = true,
    hideShareButton = false,
    showProfileAvatar = true,
  } = board.config ?? {};
  const showBoardHeader = board.config?.header?.visible ?? false;

  const boardBarRef = useRef<HTMLDivElement>(null);
  useStickyShadow(boardBarRef, "--tol-bar-scroll");

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

  // Clears all filters to ensure filter state is consistent when switching modes
  const clearAllFilters = () => {
    resetAllBoardFilters(board);
    setBoard({ ...board });
  };

  const onEditModeClick = () => {
    if (!editMode && isBoardInNavConfig(navConfig, board.id!)) {
      PopUpMessage({
        type: "warning",
        message:
          "This Board is live. Changes made here immediately affect the live Board.",
      });
    }
    clearAllFilters();
    setEditMode(!editMode);
  };

  const onLayoutModeClick = () => {
    clearAllFilters();
    setLayoutMode(!layoutMode);
  };

  const { editOrExitButton, buttons: boardActionButtons } = boardButtonsBuilder({
    activeViewId,
    privilege,
    editMode,
    onEditModeClick,
    layoutMode,
    onLayoutModeClick,
    tableLoading,
    boardTitle: board?.title!,
    newBoardCopyTitle,
    setNewBoardCopyTitle,
    onOpenBoardCopyModal,
    onOpenBoardConfigDrawer,
    allowBoardCopy,
    hideShareButton,
    roles: user?.roles ?? [],
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

  const isShowBoardHeader = !editMode && showBoardHeader;
  const isShowProfileAvatar = editMode || showProfileAvatar;
  // Don't display view tabs if there's only one view
  const hasViewTabs = (board?.order?.length ?? 0) > 1;
  const hasVisibleViewModeActions = showProfileAvatar || allowBoardCopy || !hideShareButton;
  const shouldHideHeaderBoardBar =
    isShowBoardHeader && !hasViewTabs && !hasVisibleViewModeActions;
  const boardUtilityBarButtons = [editOrExitButton, ...boardActionButtons];

  const ViewTabsContent = <ViewTabs onSaveTitle={onSaveViewTitle} {...props} />;
  const BoardBarElements = () => {
    if (isShowBoardHeader) return [ViewTabsContent];
    if (!editMode) return [ViewModeTitle];
  };

  const BoardActions = (
    <UtilityBar
      id="tol-board-utility-bar"
      buttons={boardUtilityBarButtons}
      /**
       * Displays a larger title in view mode (if no header)
       * and an editable title in edit mode.
       */
      title={!isShowBoardHeader && editMode ? editModeBoardTitle : undefined}
      elements={BoardBarElements()}
    />
  );
  const BoardOwnerAvatar = isShowProfileAvatar && (
    <ProfileAvatar
      className="tol-board-bar-profile-bubble"
      children={
        <HoverOverlay
          children={
            board?.order
              ? `${board.owner_email?.split("@")[0].replace(/\d/g, "").toUpperCase()}`
              : "..."
          }
          contents={`Board owner: ${board.owner_email}`}
          placement="left"
        />
      }
    />
  );
  const EditModeDivider = editMode && <hr />;
  const ViewTabsBar = (hasViewTabs || editMode) && (
    <UtilityBar
      id="tol-board-views-utility-bar"
      className="tol-views-bar"
      elements={[ViewTabsContent]}
      buttons={[addZone]}
    />
  );
  const BoardBar = (
    <div ref={boardBarRef} className="tol-board-bar">
      <div className="tol-board-bar-container">
        <div className="tol-board-bar-inner-container">{BoardActions}</div>
        {BoardOwnerAvatar}
      </div>
      {!isShowBoardHeader && EditModeDivider}
      {!isShowBoardHeader && ViewTabsBar}
    </div>
  );
  const EditModeOnlyButton = shouldHideHeaderBoardBar && editOrExitButton && (
    <Button {...editOrExitButton} />
  );

  return (
    <>
      {isShowBoardHeader && (
        <Header title={board.title} image={board.config?.header?.image} />
      )}
      {shouldHideHeaderBoardBar ? EditModeOnlyButton : BoardBar}
    </>
  );
}
