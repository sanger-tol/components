/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react"
import { Row, Col } from "../index"
import { getCssVarValue, isPropDefined } from "./Utils";


type Size = 'sm' | 'md' | 'lg'

interface Component {
  element: JSX.Element,
  size: Size
}

interface Components {
  [key: string]: Component
}

interface Props {
  title?: string,
  description?: string,
  components: Components
}

function Widgets(props: Props) {
  const { title, description, components } = props

  // change the background colour behind the widgets
  useEffect(() => {
    try {
      const backing = document.getElementById("tol-app-background")
      backing!.style.backgroundColor = getCssVarValue("--bs-body-widget-bg")
    } catch {}
  }, []);

  const sizeToColSize = (size: Size, xl?: boolean) => {
    switch(size) {
      case "sm":
        return xl ? 3 : 6
      case "md":
        return xl ? 6 : 12
      case "lg":
        return 12
    }
  }

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
        {Object.keys(components).map(key => {
          return (
            <Col
              key={`tol-widget-${key}`}
              lg={sizeToColSize(components[key].size)}
              xl={sizeToColSize(components[key].size, true)}
              style={{ paddingLeft: 0, paddingRight: 0 }}
            >
              <div className="tol-widget">
                {components[key].element}
              </div>
            </Col>
          )
        })}
      </Row>
    </>
  );
}

export default Widgets;
