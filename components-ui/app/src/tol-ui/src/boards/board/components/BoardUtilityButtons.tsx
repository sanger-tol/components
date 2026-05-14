/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

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
  setBoardCopyModalOpen: (value: boolean) => void,
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
            setBoardCopyModalOpen(true);
          }),
        ]
      : []),
  ];
}

export function buildViewCreationButtons(
  editMode: boolean,
  onAddView: () => void,
  setViewImportModalOpen: (open: boolean) => void,
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
      () => setViewImportModalOpen(true),
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
  setDeleteViewConfirmModal: (open: boolean) => void,
  setBoard: (board: IBoard) => void,
  setActiveViewId: (viewId: string) => void,
  board?: IBoard,
) {
  if (!board) return [];

  const onClickView = (viewId: string) => () => {
    setActiveViewId(viewId);
    updateViewInUrl(viewId);
  };

  return [
    viewSelectorTab(
      viewId,
      ViewTitle(editMode && activeViewId === viewId, viewTitle, (value) =>
        onViewTitleSave(value, viewId, board, setBoard, boardDataSource),
      ),
      onClickView(viewId),
      board?.order?.length > 1,
    ),
    deleteViewButton(
      () => setDeleteViewConfirmModal(true),
      editMode && activeViewId === viewId && board?.order?.length > 1,
    ),
    copyViewIdToClipboard(viewId, activeViewId === viewId && !editMode),
  ];
}

export function buildViewTabButtonArray(
  activeViewId: string | null,
  editMode: boolean,
  boardDataSource: TsDataSource,
  setDeleteViewConfirmModal: (open: boolean) => void,
  setBoard: (board: IBoard) => void,
  setActiveViewId: (viewId: string) => void,
  setViewImportModalOpen: (open: boolean) => void,
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
      setDeleteViewConfirmModal,
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
    setViewImportModalOpen,
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
              return {
                buttons: viewTabButtons(viewId, view.title),
              } as ITab;
            }
            return null;
          })
          .filter((btn): btn is ITab => btn !== null) ?? []),
      ]}
    />,
  ];
}
