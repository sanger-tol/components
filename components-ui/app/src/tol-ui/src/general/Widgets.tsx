/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Row,
  Col,
  getCssVarValue,
  themeListener,
  IWidgetsComponent,
  getSm,
  getLg,
  getHeight,
} from "..";

export interface PWidgets {
  components: IWidgetsComponent[];
}

export function Widgets(props: PWidgets) {
  const { components } = props;

  themeListener(() => {
    try {
      const backing = document.getElementById("tol-app-background");
      backing!.style.backgroundColor = getCssVarValue("--tol-bg-dark");
    } catch {
      return;
    }
  });

  return (
    <div>
      <Row
        style={{
          marginLeft: 0,
          marginRight: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginBottom: -16,
        }}
      >
        {components.map((item, index) => {
          return (
            <Col
              key={`tol-widget-${index}`}
              sm={getSm(item.type)}
              lg={getLg(item.type)}
              style={{
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <div
                className="tol-widget"
                style={{ height: getHeight(item.type) }}
              >
                {item.component}
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
