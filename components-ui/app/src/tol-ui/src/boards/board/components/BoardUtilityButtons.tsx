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
  PRIVILEGE,
  SortableTabs,
  TsDataSource,
  updateViewInUrl,
} from "../../..";
import {
  AddViewButton,
  copyBoardButton,
  copyViewIdToClipboard,
  deleteViewButton,
  editOrExitButton,
  ImportViewButton,
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
  onAddView: () => void,
  onOpenViewImportModal: () => void,
  board?: IBoard,
) {
  return [
    AddViewButton(
      editMode,
      onAddView,
      board?.order ? board.order.length >= 10 : false,
    ),
    ImportViewButton(
      editMode,
      onOpenViewImportModal,
      board?.order ? board.order.length >= 10 : false,
    ),
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
): { buttons: ReturnType<typeof viewSelectorTab>[]; label: ReactNode } {
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
        !isEditingTitle && board?.order?.length > 1,
      ),
      deleteViewButton(
        onOpenDeleteViewModal,
        editMode && activeViewId === viewId && board?.order?.length > 1,
      ),
      copyViewIdToClipboard(viewId, activeViewId === viewId && !editMode),
    ],
    label: isEditingTitle
      ? ViewTitle(true, viewTitle, (value) =>
          onViewTitleSave(value, viewId, board, setBoard, boardDataSource),
        )
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
) {
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
    () => onAddView(board, setBoard, setActiveViewId),
    onOpenViewImportModal,
    board,
  );

  return [
    viewCreationButtons,
    <SortableTabs
      activeId={activeViewId!}
      className="tol-views-nav"
      onReorder={
        editMode && board?.order?.length > 1 ? onReorderViews : undefined
      }
      tabs={[
        ...(board?.order
          ?.map((viewId) => {
            const view = board?.children?.[0]?.[viewId];
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
