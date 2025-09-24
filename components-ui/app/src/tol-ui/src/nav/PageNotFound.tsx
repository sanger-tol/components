/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, Header } from "..";

export function PageNotFound() {
  return (
    <Header
      title="Page Not Found"
      subTitle="Oops! You seem to be lost."
      fullHeight
    >
      <Button
        text="Return Home"
        onClick={() => {
          window.location.href = "/";
        }}
        className="return-home-button"
      />
    </Header>
  );
}
