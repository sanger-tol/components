/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import Status from "./Status";

export interface Props {
  type: string,
  message: string,
  setMessage: Function
}

function PopUpMessage(props: Props) {
  const { type, message, setMessage } = props
  const [timeoutValue, setTimeoutValue] = useState<any>(null)

  const clearMessage = (timeout: number) => {
    clearTimeout(timeoutValue!)
    setTimeoutValue(setTimeout(() => {
      setMessage('')
    }, timeout))
  }

  useEffect(() => {
    clearMessage(10000)
  }, [message])

  if (message === '') return <></>

  return (
    // onClick clears pop-up
    <span onClick={() => clearMessage(0)} className="tol-pop-up-message">
      <Status status={type} text={message} />
    </span>
  )
}

export default PopUpMessage;
