/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  DropdownButtons,
  NewBoardModal,
  IDropdownButtonConfig,
  IDropdownMainIconProps,
  createBoardAndView,
  TsDataSource,
  StaticMessage,
  BOARDS,
} from "../..";


export interface IMyBoardsHeader {
  boardDataSource: TsDataSource;
  title?: string;
  subTitle?: string;
  containerStyle?: object;
  menuStyle?: object;
  dropdownButtons?: IDropdownButtonConfig[] | IDropdownButtonConfig;
  dropdownMainIcon?: IDropdownMainIconProps;
  disabled?: boolean;
  placement?: string;
  customClass?: string;
}

export function MyBoardsHeader(props: IMyBoardsHeader) {
  const [newBoardModalOpen, setNewBoardModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const history = useHistory();

  const defaultDropdownButtons: IDropdownButtonConfig[] = [
    {
      name: "Create New Board",
      action: () => setNewBoardModalOpen(true),
    },
  ];

  const defaultDropdownMainIcon = {
    id: "create-new-board-button",
    icon: "plus",
    type: "success",
    tooltip: "Create Board",
  };

  const {
    boardDataSource,
    title = "My Boards",
    subTitle =
      `Here you can view and delete your boards, 
      along with viewing board hierarchy and components 
      of each zone.`,
    containerStyle,
    menuStyle = { marginRight: "10px" },
    dropdownButtons = defaultDropdownButtons,
    dropdownMainIcon = defaultDropdownMainIcon,
    disabled = false,
    placement = "leftStart",
    customClass = "",
  } = props;

  const handleNewBoardCreate = async (
    boardId: string,
    viewId: string,
    boardTitle: string,
    viewTitle: string,
  ) => {
    await createBoardAndView(
      boardDataSource,
      boardId, 
      boardTitle,
      viewId,
      viewTitle
    ).catch((error) => {
      console.error("Error creating board and view:", error);
      setModalError("Failed to create board, please try again.");
    }).finally(() => {
      if (modalError === "") {
        setTimeout(() => {
          history.push(`/${BOARDS.BOARD}/${boardId}`);
        }, 800);
      }
    });
  };

  const NewBoardModalContent = () => (
    <NewBoardModal
      setOpen={setNewBoardModalOpen}
      open={newBoardModalOpen}
      onConfirmClick={handleNewBoardCreate}
    />
  );

  const WarningMessage = (
    <div style={{ marginTop: 12 }}>
      <StaticMessage
        message={
          `WARNING: Dashboards are still in development,
          so existing boards or views may be removed at any point`
        }
        type={"warning"}
      />
    </div>
  );

  return (
    <div>
      <div style={containerStyle} className={customClass}>
        <div>
          <h1>{title}</h1>
          <p>{subTitle}</p>
        </div>
        <div style={newBoardModalOpen ? { display: "none" } : {}}>
          <DropdownButtons
            mainButtonIcon={dropdownMainIcon}
            placement={placement}
            disabled={disabled}
            dropdownButtons={dropdownButtons}
            menuStyle={menuStyle}
            showMessages={false}
          />
        </div>
        {newBoardModalOpen &&
          NewBoardModalContent()
        }
      </div>
      {WarningMessage}
    </div>
  );
}
