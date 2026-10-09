/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Input, Toggle } from "rsuite";
import { Drawer, upsertBoardEntity, useBoard } from "../../..";
import type { IBoardConfig, TsDataSource } from "../../..";


/** Props for the `BoardConfigDrawer` component. */
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
  const [prohibitBoardCopy, setProhibitBoardCopy] = useState<boolean>(false);
  const [hideProfileAvatar, setHideProfileAvatar] = useState<boolean>(false);
  const [hideShareButton, setHideShareButton] = useState<boolean>(false);
  const [headerVisible, setHeaderVisible] = useState<boolean>(false);
  const [headerImageUrl, setHeaderImageUrl] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setProhibitBoardCopy(!(board.config?.allowBoardCopy ?? true));
    setHideProfileAvatar(!(board.config?.showProfileAvatar ?? true));
    setHideShareButton(board.config?.hideShareButton ?? false);
    setHeaderVisible(board.config?.header?.visible ?? false);
    setHeaderImageUrl(board.config?.header?.image ?? "");
  }, [open]);

  const hasPendingChanges =
    prohibitBoardCopy !== !(board.config?.allowBoardCopy ?? true) ||
    hideProfileAvatar !== !(board.config?.showProfileAvatar ?? true) ||
    hideShareButton !== (board.config?.hideShareButton ?? false) ||
    headerVisible !== (board.config?.header?.visible ?? false) ||
    headerImageUrl.trim() !== (board.config?.header?.image ?? "").trim();

  const onSave = () => {
    const config: IBoardConfig = {
      ...board.config,
      allowBoardCopy: !prohibitBoardCopy,
      showProfileAvatar: !hideProfileAvatar,
      hideShareButton,
      header: {
        ...board.config?.header,
        visible: headerVisible,
        image: headerImageUrl.trim() || undefined,
      },
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
          checked={headerVisible}
          onChange={setHeaderVisible}
          aria-label="Board header"
          data-testid="board-header-toggle"
        />
        <span className="tol-toggle-text">Board header</span>
      </div>
      {headerVisible && (
        <div className="tol-toggle-option tol-ml-md">
          <label htmlFor="board-header-image-input">Optional header image URL</label>
          <Input
            id="board-header-image-input"
            type="url"
            value={headerImageUrl}
            onChange={setHeaderImageUrl}
            placeholder="https://example.com/image.jpg"
            aria-label="Optional header image URL"
            data-testid="board-header-image-input"
          />
        </div>
      )}
      <div className="tol-toggle-option">
        <Toggle
          checked={prohibitBoardCopy}
          onChange={setProhibitBoardCopy}
          aria-label="Prohibit copying this board"
          data-testid="board-copy-toggle"
        />
        <span className="tol-toggle-text">Prohibit copying this board</span>
      </div>
      <div className="tol-toggle-option">
        <Toggle
          checked={hideProfileAvatar}
          onChange={setHideProfileAvatar}
          aria-label="Hide the board owner"
          data-testid="board-owner-toggle"
        />
        <span className="tol-toggle-text">Hide board owner</span>
      </div>
      <div className="tol-toggle-option">
        <Toggle
          checked={hideShareButton}
          onChange={setHideShareButton}
          aria-label="Hide the share button"
          data-testid="board-share-toggle"
        />
        <span className="tol-toggle-text">Hide share button</span>
      </div>
    </Drawer>
  );
}
