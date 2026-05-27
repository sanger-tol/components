/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  MAX_VIEWS_ALLOWED,
  SortableTabs,
  useBoard,
} from "../../..";
import {
  addViewButton,
  buildViewTab,
  importViewButton,
} from ".";


export interface PViewTabs {
  activeViewId: string | null;
  onOpenDeleteViewModal: () => void;
  onOpenViewImportModal: () => void;
  onClickView: (viewId: string) => () => void;
  onAddView: () => void;
  onReorderView: (reorderedIds: string[]) => void;
  onSaveTitle: (viewId: string, newTitle: string) => void;
}

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

  return (
    <>
      {addViewButton(editMode, onAddView, isMaxViews)}
      {importViewButton(editMode, onOpenViewImportModal, isMaxViews)}
      <SortableTabs
        activeId={activeViewId!}
        className="tol-views-nav"
        onReorder={editMode ? onReorderView : undefined}
        tabs={
          isMoreThanOneView
            ? board?.order?.map((viewId) => {
                const view = board?.children?.[viewId];
                return buildViewTab(
                  viewId,
                  view?.title!,
                  activeViewId === viewId,
                  editMode,
                  isMoreThanOneView,
                  onOpenDeleteViewModal,
                  onClickView,
                  onSaveTitle,
                );
              })
            : undefined
        }
      />
    </>
  );
}
