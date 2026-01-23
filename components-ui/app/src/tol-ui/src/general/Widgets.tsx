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
      const backing = document.getElementById("tol-smart-app-background");
      backing!.style.backgroundColor = getCssVarValue("--tol-bg-dark");
    } catch {
      return;
    }
  });

  return (
    <div>
      <Row
        style={{
          marginTop: -5,
          marginLeft: -5,
          marginRight: -5,
          paddingLeft: 0,
          paddingRight: 0,
          marginBottom: -22,
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
