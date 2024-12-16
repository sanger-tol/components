/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useState, useEffect } from "react";
import {
  MyBoardsHeader,
  Widgets,
  httpClient,
  Message,
  Toaster,
  Loader
} from "../tol-ui/src";
import { Accordion } from "../tol-ui/src/boardNew/components";
import { getUserFromLocalStorage } from "../tol-ui/src/services/localStorage/localStorageService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const containerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "20px",
  position: "relative",
};

const getBoardDetails = async (id: string, setErrorMessage: any) => {
  try {
    const res = await httpClient().get("/board", {
      params: {
        filter: {
          and_: {
            user_id: { eq: { value: id } },
          },
        },
      },
    });
    const boardDetails = res.data.data.map((board: any) => ({
        id: board.id,
        title: board.attributes.title,
    }));
    return boardDetails;
  } catch (error) {
    console.warn("Error fetching boards", error);
    setErrorMessage("Error fetching boards. Please reload and try again.");
    return [];
  }
}

const MyBoards = () => {

  const [boardDetails, setBoardDetails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toaster = Toaster();

  useEffect(() => {
    fetchBoardDetails();
  }, []);

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
      try {
        const ids: any = await getBoardDetails(userId, setErrorMessage);
        setBoardDetails(ids);
      } catch (error) {
        console.error("Error fetching boards:", error);
        setErrorMessage("Error fetching board IDs. Please try again later.");
      } finally {
        setLoading(false);
      }
    } else {
      console.warn("User ID not found.");
      setErrorMessage("User ID not found. Please reload and try again.");
    }
  };

  useEffect(() => {
    if (errorMessage) {
      toaster.push(errMessage);
    }
  }, [errorMessage]);

  const noBoards = (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginTop: "60px" }}>
        <span>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            size="3x"
            style={{ color: "#EBDE6B" }}
          />
          <p style={{ marginTop: "5px", fontSize: "16px" }}>
            You have no boards yet. Click the button to create or import a new
            board to get started.
          </p>
        </span>
      </div>
    </div>
  );

  const myBoards = (
    <div style={{ paddingLeft: "80px", paddingRight: "80px" }}>
      <MyBoardsHeader containerStyle={containerStyle} />
      {!loading ? (
        boardDetails && boardDetails.length > 0 ? (
          <Accordion boardDetails={boardDetails} />
        ) : (
          <div>{noBoards}</div>
        )
      ) : (
        <div className="fixed-full-page">
          <div className="fixed-centered-loader">
            <span style={{display: "flex", justifyContent: "center"}}><Loader /></span>
            <p style={{marginTop: "10px"}}>Loading Your Boards...</p>
          </div>
        </div>
      )}
    </div>
  );

  const components = [
    {
      component: myBoards,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}

export default MyBoards;
