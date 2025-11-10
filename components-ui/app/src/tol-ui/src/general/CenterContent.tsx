/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Container, Row, Col } from "..";

export function CenterContent(props: any) {
  const { children } = props;
  return (
    <Container>
      <Row>
        <Col>
          {children}
        </Col>
      </Row>
    </Container>
  );
}
