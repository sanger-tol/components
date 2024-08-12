/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Container } from "react-bootstrap";
import { HeaderButton } from "../models/HeaderButton";


export interface Props {
  title?: string,
  subTitle?: string,
  buttons?: HeaderButton[]
  pageEmpty?: boolean
}

class Header extends React.Component<Props> {
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
                <div className='navbar-filler'/>
                <h1 className="masthead-heading mb-0">{this.props.title}</h1>
                <h2 className="masthead-subheading mb-0">{this.props.subTitle}</h2>
                {this.buttons.map(button => (
                  <a href={button.href} className="btn btn-primary btn-xl rounded-pill mt-5" key={button.text}>{button.text}</a>
                ))}
              </Container>
            </div>
          </header>
        </div>
        {this.pageEmpty ?
          <h6>‎</h6>
          :
          <></>
        }
      </div>
    );
  }
}

export default Header;