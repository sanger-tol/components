/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { Timeline as TL } from "rsuite";
import { Col, Row } from "../index";

interface Props {
    id: string,
    timelineTitle: string,
    endless?: boolean,
    timelineData: {
        date: string,
        title: string,
        desc: string,
        type: string | JSX.Element,
        color?: string,
    }[]
}

function Timeline(props: Props) {
    const { id, timelineTitle, endless, timelineData } = props;
    const logoDefault: string = "#fff";
    const dotDefault: string = "#d9d9d9";
    const activeDotDefault: string = "#039be5";

    return (
        <Col>
            <div style={{ display: "contents" }}>
                <Row style={{ marginBottom: "10px" }}>
                    <p className="timeline-header-text">{timelineTitle}</p>
                </Row>
                <Row>
                    <TL endless={endless} className="timeline-wrapper" id={id}>
                        {timelineData.map((item, index) => (
                            <TL.Item
                                key={item.date}
                                time={item.date}
                                dot={
                                    React.isValidElement(item.type) ? (
                                        <div
                                            className="timeline-custom-icon-background-color"
                                            style={{ backgroundColor: item.color || logoDefault }}
                                        >
                                            {item.type}
                                        </div>
                                    ) : item.color !== undefined ? (
                                        <div
                                            className="timeline-custom-dot-color"
                                            style={{
                                                backgroundColor:
                                                    item.type === "active-dot"
                                                        ? activeDotDefault || dotDefault
                                                        : item.color || dotDefault,
                                            }}
                                        ></div>
                                    ) : item.type === "active-dot" ? (
                                        <div
                                            className="timeline-custom-dot-color"
                                            style={{ backgroundColor: activeDotDefault || dotDefault }}
                                        ></div>
                                    ) : item.type === "dot" && index === timelineData.length - 1 ? (
                                        <div
                                            className="timeline-custom-dot-color"
                                            style={{ backgroundColor: dotDefault }}
                                        ></div>
                                    ) : undefined
                                }
                            >
                                <p className="timeline-item-header-text">{item.title}</p>
                                <p>{item.desc}</p>
                            </TL.Item>
                        ))}
                    </TL>
                </Row>
            </div>
        </Col>

  );
}

export default Timeline;