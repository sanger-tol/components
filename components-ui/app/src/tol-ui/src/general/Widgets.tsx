/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { Row, Col } from "../index";
import { getCssVarValue, isPropDefined } from "./Utils";


interface Props {
  title?: string,
  description?: string,
  components: JSX.Element[]
}

// fill div if only 1 widget
const getHalfScreenWidgetSize = (componentsLength: number) => {
  switch(componentsLength) {
  case 1:
    return 12;
  default:
    return 6;
  }
};

function Widgets(props: Props) {
  const { title, description, components } = props;

  // change the background colour behind the widgets
  useEffect(() => {
    try {
      const backing = document.getElementById("tol-app-background");
      backing!.style.backgroundColor = getCssVarValue("--bs-body-widget-bg");
    } catch {
      return;
    }
  }, []);

  // fill div if only 1 widget
  const halfSize = getHalfScreenWidgetSize(components.length);

  return (
    <>
      {isPropDefined(title) || isPropDefined(description) ? 
        <Row style={{ marginLeft: 0, marginRight: 0, paddingLeft: 12, paddingRight: 12}}>
          <Col style={{ paddingLeft: 0, paddingRight: 0 }}>
            <div className="tol-widget">
              <h2 className="widget-title">{title}</h2>
              <p>{description}</p>
            </div>
          </Col>
        </Row>
        :
        <></>
      }
      <Row style={{ marginLeft: 0, marginRight: 0, paddingLeft: 12, paddingRight: 12}}>
        {components.map((component, index) => {
          return (
            <Col
              key={`tol-widget-${index}`}
              lg={12}
              xl={halfSize}
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              <div className="tol-widget">
                {component}
              </div>
            </Col>
          );
        })}
      </Row>
    </>
  );
}

export default Widgets;
