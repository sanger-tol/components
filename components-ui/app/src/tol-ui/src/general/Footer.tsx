/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  ReactNode
} from "react"
import {
  Container,
  Row,
  Col,
  SangerLogo
} from "..";


export interface PFooter {
  /**
   * Controls whether the footer is rendered.
   */
  visible?: boolean;
  /**
   * Replaces the default footer content when provided.
   */
  element?: ReactNode;
}

export function Footer(props: PFooter) {
  const {
    visible = true,
    element
  } = props;

  if (visible) {
    return (
      <footer className="tol-footer">
        {element ? element :
          <Container className="tol-footer-default">
            <Row sm={1} md={2}>
              <Col sm={6} md={4} lg={3}>
                <div className="center">
                  <a href="https://sanger.ac.uk">
                    <SangerLogo />
                  </a>
                </div>
              </Col>
              <Col sm={6} md={{ span: 4, offset: 4 }} lg={{ span: 3, offset: 6 }}>
                <div className="center">
                  <p className="footer-text">
                    <a href="https://www.sanger.ac.uk/programme/tree-of-life/">
                      Tree of Life Programme
                    </a>
                    <br />
                    <a href="https://www.sanger.ac.uk/group/tree-of-life-enabling-platforms/">
                      Enabling Platforms
                    </a>
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        }
      </footer>
    );
  }
}
