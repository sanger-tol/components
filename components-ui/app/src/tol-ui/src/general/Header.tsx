/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import {
  Container,
  HeaderButton,
  Button
} from "..";


interface Props {
  title?: string;
  subTitle?: string;
  buttons?: HeaderButton[];
  pageEmpty?: boolean;
}

export class Header extends React.Component<Props> {
  buttons: HeaderButton[] = [];
  pageEmpty = true;

  constructor(props: Props) {
    super(props);

    if (props.buttons !== undefined) {
      this.buttons = props.buttons;
    }
    if (props.pageEmpty === undefined) {
      this.pageEmpty = false;
    }
  }

  render() {
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
                <h1 className="masthead-heading mb-0">{this.props.title}</h1>
                <h2 className="masthead-subheading mb-0">
                  {this.props.subTitle}
                </h2>
                {this.buttons.map((button) => (
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
        {this.pageEmpty ? <h6>‎</h6> : <></>}
      </div>
    );
  }
}
