/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Toggle } from "rsuite";
import { Drawer, upsertBoardEntity, useBoard } from "../../..";
import type { IBoardConfig, TsDataSource } from "../../..";

export interface PBoardConfigDrawer {
  /** Whether the configuration drawer is open. */
  open: boolean;
  /** Updates whether the configuration drawer is open. */
  setOpen: Dispatch<SetStateAction<boolean>>;
  /** Data source used to persist board configuration. */
  boardDataSource: TsDataSource;
}

/** Renders board-level configuration options. */
export function BoardConfigDrawer(props: PBoardConfigDrawer) {
  const { open, setOpen, boardDataSource } = props;
  const { board, setBoard } = useBoard();
  const [allowBoardCopy, setAllowBoardCopy] = useState<boolean>(true);
  const [showProfileAvatar, setShowProfileAvatar] = useState<boolean>(true);

  useEffect(() => {
    if (!open) return;
    setAllowBoardCopy(board.config?.allowBoardCopy ?? true);
    setShowProfileAvatar(board.config?.showProfileAvatar ?? true);
  }, [open]);

  const hasPendingChanges =
    allowBoardCopy !== (board.config?.allowBoardCopy ?? true) ||
    showProfileAvatar !== (board.config?.showProfileAvatar ?? true);

  const onSave = () => {
    const config: IBoardConfig = {
      ...board.config,
      allowBoardCopy,
      showProfileAvatar,
    };
    setBoard({ ...board, config });
    upsertBoardEntity(boardDataSource, board.id!, { config });
  };

  return (
    <Drawer
      open={open}
      setOpen={setOpen}
      title="Board Options"
      onSave={onSave}
      hasPendingChanges={hasPendingChanges}
    >
      <div className="tol-toggle-option">
        <Toggle
          checked={allowBoardCopy}
          onChange={setAllowBoardCopy}
          aria-label="Allow users to copy this board"
          data-testid="board-copy-toggle"
        />
        <span className="tol-toggle-text">Allow users to copy this board</span>
      </div>
      <div className="tol-toggle-option">
        <Toggle
          checked={showProfileAvatar}
          onChange={setShowProfileAvatar}
          aria-label="Show the board owner"
          data-testid="board-owner-toggle"
        />
        <span className="tol-toggle-text">Show board owner</span>
      </div>
    </Drawer>
  );
}
