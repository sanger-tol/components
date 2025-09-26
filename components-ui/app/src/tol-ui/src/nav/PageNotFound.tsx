/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Header } from "..";
import { useHistory } from "react-router-dom";


export function PageNotFound() {
  const history = useHistory();

  return (
    <Header
      title="Page Not Found"
      subTitle="Oops! You seem to be lost."
      fullHeight
    >
      <Button
        icon="home"
        text="Return Home"
        onClick={() => history.push("/")}
        className="return-home-button"
      />
    </Header>
  );
}