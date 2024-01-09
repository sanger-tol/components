/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Container, Row, Col } from "../index";
import { SangerLogo } from "./Icons";


function Footer() {
  return (
    <footer className="footer">
      <Container>
        <Row sm={1} md={2}>
          <Col sm={6} md={4} lg={3}>
            <div className="centre">
              <a href="https://sanger.ac.uk">
                <SangerLogo />
              </a>
            </div>
          </Col>
          <Col sm={6} md={{ span: 4, offset: 4 }} lg={{ span: 3, offset: 6 }}>
            <div className="centre">
              <p className="footer-text">
                <a href="https://www.sanger.ac.uk/programme/tree-of-life/">Tree of Life Programme</a>
                <br />
                <a href="https://www.sanger.ac.uk/group/tree-of-life-enabling-platforms/">Enabling Platforms</a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;