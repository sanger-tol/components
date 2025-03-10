/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Row, Col } from "../index";
import { getCssVarValue } from "./utils";
import { themeListener } from "../hooks/listeners";

interface Component {
  component: JSX.Element;
  type: string;
}

interface Props {
  components: Component[];
}

function Widgets(props: Props) {
  const { components } = props;

  themeListener(() => {
    try {
      const backing = document.getElementById("tol-app-background");
      backing!.style.backgroundColor = getCssVarValue("--tol-bg-dark");
    } catch {
      return;
    }
  });

  const getSm = (type: string) => {
    switch (type) {
      case "sm":
        return 6;
      default:
        return 12;
    }
  };

  const getLg = (type: string) => {
    switch (type) {
      case "sm":
        return 3;
      case "md":
        return 6;
      default:
        return 12;
    }
  };

  const getHeight = (type: string) => {
    switch (type) {
      case "sm":
        return 150;
      case "md":
        return 450;
      case "lg":
        return 450;
      case "xl":
        return 600;
    }
  };

  const rowStyle = {
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: -16,
  };

  const colStyle = {
    paddingLeft: 0,
    paddingRight: 0,
  };

  return (
    <div>
      <Row style={rowStyle}>
        {components.map((item, index) => {
          return (
            <Col
              key={`tol-widget-${index}`}
              sm={getSm(item.type)}
              lg={getLg(item.type)}
              style={colStyle}
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

export default Widgets;
