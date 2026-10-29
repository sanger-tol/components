/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Button, Header, PAGE_NOT_FOUND_REDIRECT_SECONDS } from "..";
import { useHistory } from "react-router-dom";

export function PageNotFound() {
  const history = useHistory();
  const [secondsLeft, setSecondsLeft] = useState(PAGE_NOT_FOUND_REDIRECT_SECONDS);

  const goHome = () => history.push("/"); 

  useEffect(() => {
    if (secondsLeft <= 0) {
      goHome();
      return;
    }
    const timeout = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timeout);
  }, [secondsLeft]);

  return (
    <Header
      title="Page Not Found"
      subTitle="Oops! You seem to be lost."
    >
      <Button
        outline
        icon="home"
        text={`Return Home (${secondsLeft})`}
        onClick={goHome}
        className="return-home-button"
      />
    </Header>
  );
}