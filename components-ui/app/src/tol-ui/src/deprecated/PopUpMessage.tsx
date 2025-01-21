/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import Status from "../deprecated/Status";

export interface Props {
  type: string,
  message: string,
  setMessage: any
}

function PopUpMessage(props: Props) {
  const { type, message, setMessage } = props;
  const [timeoutValue, setTimeoutValue] = useState<any>(null);

  const clearMessage = (timeout: number) => {
    clearTimeout(timeoutValue!);
    setTimeoutValue(setTimeout(() => {
      setMessage('');
    }, timeout));
  };

  useEffect(() => {
    clearMessage(10000);
  }, [message]);

  if (message === '') return <></>;

  return ReactDOM.createPortal(
    // onClick clears pop-up
    <span onClick={
      (e) => {
        clearMessage(0);
        e.stopPropagation();
      }} 
    className="tol-pop-up-message"
    >
      <Status status={type} text={message} />
    </span>,
    document.body
  );
}

export default PopUpMessage;
