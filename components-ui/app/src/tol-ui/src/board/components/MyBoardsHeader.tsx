/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { DropdownButtons } from "./index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { DropdownButtonProps, DropdownMainIconProps } from "./DropdownButtons";
import { useHistory } from "react-router-dom";

interface Props {
  title?: string;
  subTitle?: string;
  containerStyle?: object;
  menuStyle?: object;
  dropdownButtons?: DropdownButtonProps[]; // | DropdownButtonProps;
  dropdownMainIcon?: DropdownMainIconProps;
  globalDisabled?: boolean;
  placement?: string;
  customClass?: string;
}

const DEFAULT_TITLE = "My Boards";
const DEFAULT_SUB_TITLE =
  "Here you can view, share, rename and delete your boards, views and components.";

function MyBoardsHeader(props: Props) {
  const defaultDropdownButtons: DropdownButtonProps[] = [
    {
      dropdownButtonName: "Create New Board",
      action: () => {
        history.push("/dashboarding/dashboard");
      },
    },
    {
      dropdownButtonName: "Import Board",
      action: () => {
        console.log("Import Board");
      },
    },
  ];

  const defaultDropdownMainIcon = {
    mainIcon: <FontAwesomeIcon icon={faPlus} size="lg" />,
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

  const history = useHistory();

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
      />
    </div>
  );
}

export default MyBoardsHeader;
