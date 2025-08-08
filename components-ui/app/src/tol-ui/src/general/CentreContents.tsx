/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Container, Row, Col } from "..";

export function CentreContents(props: any) {
  const { children } = props;
  return (
    <Container>
      <Row>
        <Col>
          <div className="p-1">{children}</div>
        </Col>
      </Row>
    </Container>
  );
}
