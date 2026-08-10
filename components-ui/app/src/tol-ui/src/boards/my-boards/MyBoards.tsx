/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { Toggle } from "rsuite";
import {
  Widgets,
  Message,
  Toaster,
  BoardAccordion,
  MyBoardsHeader,
  getUserFromLocalStorage,
  getBoardDetails,
  LoadingContent,
  PBoard,
  isBoardInNavConfig,
  useApp,
} from "../..";

export function MyBoards(props: PBoard) {
  const { boardDataSource } = props;

  const { navConfig } = useApp();

  const [boardDetails, setBoardDetails] = useState<any[]>([]);
  const [liveOnly, setLiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toaster = Toaster();

  useEffect(() => {
    fetchBoardDetails();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      toaster.push(errMessage);
    }
  }, [errorMessage]);

  const hasLiveBoards = boardDetails.some((board) =>
    isBoardInNavConfig(navConfig, board.id),
  );

  useEffect(() => {
    if (!hasLiveBoards) setLiveOnly(false);
  }, [hasLiveBoards]);

  const errMessage = (
    <Message
      children={errorMessage}
      type="error"
      showIcon={true}
      closable
      styles={{ marginTop: "5px" }}
    />
  );

  const fetchBoardDetails = async () => {
    const user = getUserFromLocalStorage();
    const userId = user.id;
    if (userId) {
      await getBoardDetails(boardDataSource, userId, setErrorMessage)
        .then((data) => {
          setBoardDetails(data ?? []);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setErrorMessage("User not found. Please login and try again.");
      setLoading(false);
    }
  }

  const NoBoards = (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginTop: "60px" }}>
        <span>
          <FontAwesomeIcon
            icon={faCircleInfo}
            size="3x"
            style={{ color: "#C2D3CD" }}
          />
          <p style={{ marginTop: "5px", fontSize: "16px" }}>
            You have no boards yet. Click the button to create or import a new
            board to get started.
          </p>
        </span>
      </div>
    </div>
  );

  const Header = (
    <MyBoardsHeader
      boardDataSource={boardDataSource}
    />
  );

  const displayedBoards = liveOnly
    ? boardDetails.filter((board) => isBoardInNavConfig(navConfig, board.id))
    : boardDetails;

  const Content = loading ? (
    <LoadingContent text={"Finding your Boards..."} />
  ) : (
    <div className="my-boards-container">
      {hasLiveBoards && (
        <label className="tol-my-boards-live-toggle">
          <Toggle
            checked={liveOnly}
            onChange={setLiveOnly}
          />
          Only show live Boards
        </label>
      )}
      {displayedBoards.length > 0 ? (
        <BoardAccordion
          boardDetails={displayedBoards}
          setBoardDetails={setBoardDetails}
          boardDataSource={boardDataSource}
        />
      ) : NoBoards}
    </div>
  );

  const components = [
    {
      component: Header,
      type: "full",
    },
    {
      component: Content,
      type: "full",
    },
  ];

  return (
    <Widgets components={components} />
  )
}
