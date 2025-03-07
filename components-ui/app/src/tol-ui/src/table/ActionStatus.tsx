/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { StatusMessage } from "../messaging";
// import RemoteTable from "./RemoteTable";

interface Props {
  status: string;
  //endpoint: string;
}

function ActionStatus(props: Props) {
  const { status } = props;
  const RELOAD_INTERVAL = 10;
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState(RELOAD_INTERVAL);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsSinceLastUpdate((prevSeconds) => {
        if (prevSeconds === 0) {
          // reset the countdown AND CALL THE ENDPOINT
          return RELOAD_INTERVAL;
        }
        // decrement the countdown
        return prevSeconds - 1;
      });
    }, 1000);
  
    return () => clearInterval(intervalId); // cleanup interval on component unmount
  }, []);

  return (
    <>
      <StatusMessage
        message={status}
        status="info"
        bordered
      />
      Seconds remaining until refresh: {secondsSinceLastUpdate}...
    </>
  );
}

export default ActionStatus;
