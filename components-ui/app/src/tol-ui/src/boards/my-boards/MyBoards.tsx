/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import {
  Widgets,
  Message,
  Toaster,
  BoardAccordion,
  MyBoardsHeader,
  getUserFromLocalStorage,
  getBoardDetails,
  LoadingContent,
  InitialBoardsTourModal,
  hasTourBeenSeen,
  PBoard
} from "../..";


export function MyBoards(props: PBoard) {
  const { boardDataSource } = props;
  const [boardDetails, setBoardDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialBoardsTourModalOpen, setInitialBoardsTourModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const toaster = Toaster();

  useEffect(() => {
    fetchBoardDetails();
    fetchTourStatus();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      toaster.push(errMessage);
    }
  }, [errorMessage]);

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

  const fetchTourStatus = async () => {
    const id = getUserFromLocalStorage().id as string | undefined;
    if (!id) return;
    setUserId(id);

    const tourStepSeen = await hasTourBeenSeen("initial", id);
    setInitialBoardsTourModalOpen(!tourStepSeen);
  }

  if (loading) return <LoadingContent text={"Finding your Boards..."} />;

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

  const Content = (
    <div className="my-boards-container">
      {boardDetails && boardDetails.length > 0 ? (
        <BoardAccordion
          boardDetails={boardDetails}
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

  return (<>
    <Widgets components={components} />
    <InitialBoardsTourModal
      open={initialBoardsTourModalOpen}
      setOpen={setInitialBoardsTourModalOpen}
      userId={userId}
    />
  </>)
}
