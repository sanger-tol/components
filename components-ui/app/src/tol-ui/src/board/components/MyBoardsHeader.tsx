/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useState } from "react";
import { DropdownButtons, NewBoardModal } from "./index";
import { DropdownButtonProps, DropdownMainIconProps } from "./DropdownButtons";
import { useHistory } from "react-router-dom";
import { createBoardAndView } from "../Utils";
import { TsDataSource } from "../../index";

interface Props {
  title?: string;
  subTitle?: string;
  containerStyle?: object;
  menuStyle?: object;
  dropdownButtons?: DropdownButtonProps[] | DropdownButtonProps;
  dropdownMainIcon?: DropdownMainIconProps;
  globalDisabled?: boolean;
  placement?: string;
  customClass?: string;
}

const DEFAULT_TITLE = "My Boards";
const DEFAULT_SUB_TITLE =
  "Here you can view and delete your boards, along with viewing board hierarchy and components of each zone.";

function MyBoardsHeader(props: Props) {
  const [newBoardModalOpen, setNewBoardModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");

  const history = useHistory();
  const ds = new TsDataSource();

  const defaultDropdownButtons: DropdownButtonProps[] = [
    {
      dropdownButtonName: "Create New Board",
      action: () => handleOpenModal(),
    },
  ];

  const handleNewBoardCreate = async (
    boardId: string,
    viewId: string,
    boardTitle: string,
    viewTitle: string
  ) => {
    try {
      createBoardAndView(ds, boardId, boardTitle, viewId, viewTitle);
    } catch {
      setModalError("Failed to create board, please try again.");
    } finally {
      if (modalError === "") {
        setTimeout(() => {
          history.push(`/board/${boardId}`);
        }, 800);
      }
    }
  };

  const handleOpenModal = () => {
    setNewBoardModalOpen(true);
  };

  const newBoardModal = () => (
    <NewBoardModal
      setOpen={setNewBoardModalOpen}
      open={newBoardModalOpen}
      onConfirmClick={(
        boardId: string,
        viewId: string,
        boardTitle: string,
        viewTitle: string
      ) => handleNewBoardCreate(boardId, viewId, boardTitle, viewTitle)}
    />
  );

  const defaultDropdownMainIcon = {
    icon: "plus",
    type: "success",
    tooltip: "Create Board",
    tooltipPosition: "bottom",
  };

  const {
    title = DEFAULT_TITLE,
    subTitle = DEFAULT_SUB_TITLE,
    containerStyle,
    menuStyle = { marginRight: "10px" },
    dropdownButtons = defaultDropdownButtons,
    dropdownMainIcon = defaultDropdownMainIcon,
    globalDisabled = false,
    placement = "leftStart",
    customClass = "",
  } = props;

  return (
      <div style={containerStyle} className={customClass}>
        <div>
          <h1>{title}</h1>
          <p>{subTitle}</p>
        </div>
        <DropdownButtons
          mainButtonIcon={dropdownMainIcon}
          placement={placement}
          globalDisabled={globalDisabled}
          dropdownButtons={dropdownButtons}
          menuStyle={menuStyle}
          showMessages={false}
        />
        {newBoardModalOpen && newBoardModal()}
      </div>
  );
}

export default MyBoardsHeader;
