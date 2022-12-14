/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Container, Row, Col } from "react-bootstrap"; 

function CentreContents(props: any) {
  return (
    <Container>
      <Row>
        <Col>
          <div className="p-5">
            {props.children}
          </div>
        </Col>
        </Row>
    </Container>
  );
}

export default CentreContents;