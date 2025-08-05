/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Container, IHeaderButton, Button } from "..";

export interface PHeader {
  title?: string;
  subTitle?: string;
  buttons?: IHeaderButton[];
  pageEmpty?: boolean;
}

export function Header(PHeader) {
  const { title, subTitle, buttons = [], pageEmpty = false } = PHeader;

  return (
    <div>
      <div className="header">
        <header className="masthead text-center text-white">
          <div className="masthead-content">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <Container>
              <div className="navbar-filler" />
              <h1 className="masthead-heading mb-0">{title}</h1>
              <h2 className="masthead-subheading mb-0">{subTitle}</h2>
              {buttons.map((button) => (
                <div key={button.text} style={{ marginTop: "30px" }}>
                  <Button
                    text={button.text}
                    onClick={() => {
                      window.location.href = button.href;
                    }}
                  />
                </div>
              ))}
            </Container>
          </div>
        </header>
      </div>
      {pageEmpty ? <h6>‎</h6> : <></>}
    </div>
  );
}
