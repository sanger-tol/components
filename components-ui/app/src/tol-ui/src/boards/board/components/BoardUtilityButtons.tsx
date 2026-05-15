/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactNode } from "react";
import {
  IBoard,
  ITab,
  onAddView,
  onViewTitleSave,
  PButton,
  PRIVILEGE,
  SortableTabs,
  TsDataSource,
  updateViewInUrl,
} from "../../..";
import {
  addViewButton,
  copyBoardButton,
  copyViewIdToClipboard,
  deleteViewButton,
  editOrExitButton,
  importViewButton,
  layoutOrExitButton,
  shareButton,
  viewSelectorTab,
  ViewTitle,
} from ".";

export function buildUtilityBarButtons(
  editMode: boolean,
  layoutMode: boolean,
  privilege: string | undefined,
  tableLoading: boolean,
  setEditMode: (value: boolean) => void,
  setLayoutMode: (value: boolean) => void,
  onOpenBoardCopyModal: () => void,
  newBoardCopyTitle: string,
  setNewBoardCopyTitle: (value: string) => void,
  boardTitle: string,
) {
  return [
    editOrExitButton(
      editMode,
      (privilege === PRIVILEGE.BOARD.WRITABLE && !layoutMode) || false,
      editMode && tableLoading,
      tableLoading,
      () => setEditMode(!editMode),
    ),
    layoutOrExitButton(
      layoutMode,
      (privilege === PRIVILEGE.BOARD.WRITABLE && editMode) || false,
      () => setLayoutMode(!layoutMode),
    ),
    ...(!editMode
      ? [
          shareButton,
          copyBoardButton(() => {
            if (!newBoardCopyTitle.trim()) {
              setNewBoardCopyTitle(`${boardTitle} - copy`);
            }
            onOpenBoardCopyModal();
          }),
        ]
      : []),
  ];
}

export function buildViewCreationButtons(
  editMode: boolean,
  onAddViewClick: () => void,
  onOpenViewImportModal: () => void,
  board?: IBoard,
) {
  const isMaxViews = (board?.order?.length ?? 0) >= 10;
  return [
    addViewButton(editMode, onAddViewClick, isMaxViews),
    importViewButton(editMode, onOpenViewImportModal, isMaxViews),
  ];
}

export function buildSingleViewTabButton(
  viewId: string,
  viewTitle: string,
  activeViewId: string | null,
  editMode: boolean,
  boardDataSource: TsDataSource,
  onOpenDeleteViewModal: () => void,
  setBoard: (board: IBoard) => void,
  setActiveViewId: (viewId: string) => void,
  board?: IBoard,
): { buttons: PButton[]; label: ReactNode } {
  if (!board) return { buttons: [], label: undefined };

  const onClickView = (viewId: string) => () => {
    setActiveViewId(viewId);
    updateViewInUrl(viewId);
  };

  const isEditingTitle = editMode && activeViewId === viewId;

  return {
    buttons: [
      viewSelectorTab(
        viewId,
        viewTitle,
        onClickView(viewId),
        !isEditingTitle && (board?.order?.length ?? 0) > 1,
      ),
      deleteViewButton(
        onOpenDeleteViewModal,
        editMode && activeViewId === viewId && (board?.order?.length ?? 0) > 1,
      ),
      copyViewIdToClipboard(viewId, activeViewId === viewId && !editMode),
    ],
    label: isEditingTitle
      ? ViewTitle(true, viewTitle, async (newTitle) => {
          const updatedBoard = await onViewTitleSave(newTitle, viewId, board, boardDataSource);
          if (updatedBoard) setBoard(updatedBoard);
        })
      : undefined,
  };
}

export function buildViewTabButtonArray(
  activeViewId: string | null,
  editMode: boolean,
  boardDataSource: TsDataSource,
  onOpenDeleteViewModal: () => void,
  setBoard: (board: IBoard) => void,
  setActiveViewId: (viewId: string) => void,
  onOpenViewImportModal: () => void,
  board?: IBoard,
): ReactNode[] {
  if (!board) return [];

  const viewTabButtons = (viewId: string, viewTitle: string) =>
    buildSingleViewTabButton(
      viewId,
      viewTitle,
      activeViewId,
      editMode,
      boardDataSource,
      onOpenDeleteViewModal,
      setBoard,
      setActiveViewId,
      board,
    );

  const onReorderViews = (orderedIds: string[]) => {
    board.order = orderedIds;
    setBoard({ ...board });
  };

  const viewCreationButtons = buildViewCreationButtons(
    editMode,
    () => {
      const { updatedBoard, newViewId } = onAddView(board);
      setBoard(updatedBoard);
      setActiveViewId(newViewId);
      updateViewInUrl(newViewId);
    },
    onOpenViewImportModal,
    board,
  );

  return [
    ...viewCreationButtons,
    <SortableTabs
      key="views-sortable-tabs"
      activeId={activeViewId!}
      className="tol-views-nav"
      onReorder={
        editMode && board?.order?.length > 1 ? onReorderViews : undefined
      }
      tabs={[
        ...(board?.order
          ?.map((viewId) => {
            const view = board?.children?.[viewId];
            if (view) {
              const { buttons, label } = viewTabButtons(viewId, view.title || "Untitled");
              return { buttons, label } as ITab;
            }
            return null;
          })
          .filter((btn): btn is ITab => btn !== null) ?? []),
      ]}
    />,
  ];
}
