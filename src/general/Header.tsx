/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import HeaderButton from "../models/HeaderButton";


export interface Props {
  title: String,
  buttons: HeaderButton[]
}

class Header extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="header">
        <header className="masthead text-center text-white">
          <div className="masthead-content">
            <Container>
              <h1 className="masthead-heading mb-0">{this.props.title}</h1>
              <h2 className="masthead-subheading mb-0">Tree of Life</h2>
              {this.props.buttons.map(button => (
                <Link to={button.href} className="btn btn-primary btn-xl rounded-pill mt-5" key={button.text}>{button.text}</Link>
              ))}
            </Container>
          </div>
          <div className="bg-circle-1 bg-circle"></div>
          <div className="bg-circle-2 bg-circle"></div>
          <div className="bg-circle-3 bg-circle"></div>
          <div className="bg-circle-4 bg-circle"></div>
        </header>
      </div>
    );
  }
}

export default Header;