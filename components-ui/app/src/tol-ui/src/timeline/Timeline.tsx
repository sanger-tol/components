/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect } from "react";
import { Timeline as RSTimeline } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Col, Row } from "..";
import {
  ITimelineData,
  ITimelineItem,
  TIMELINE_DOTS,
  parseDataPoints,
  sortTimelineByDate,
} from "..";

export interface PTimeline {
  id: string;
  title: string;
  endless?: boolean;
  data: ITimelineData;
  dateWithDay?: boolean;
  defaultIcon?: boolean;
}

export function Timeline(props: PTimeline) {
  const { id, title, endless, data, dateWithDay, defaultIcon } = props;
  const [sortedData, setSortedData] = useState<ITimelineItem[]>([]);

  useEffect(() => {
    const parsedData: any = parseDataPoints(data);
    const sortedTimeline = sortTimelineByDate(parsedData);
    setSortedData(sortedTimeline);
  }, [data]);

  return (
    <Col>
      <div style={{ display: "contents" }}>
        <Row style={{ marginBottom: "10px" }}>
          <p className="timeline-header-text">{title}</p>
        </Row>
        <Row>
          <RSTimeline endless={endless} className="timeline-wrapper" id={id}>
            {sortedData
              .filter((item: ITimelineItem) => item.date !== null)
              .map((item: ITimelineItem, index: Number) => (
                <RSTimeline.Item
                  key={item.date!.toISOString()}
                  time={
                    dateWithDay
                      ? item.date!.toDateString()
                      : item.date!.toDateString().split(" ").slice(1).join(" ")
                  }
                  dot={(() => {
                    if (React.isValidElement(item.icon) || defaultIcon) {
                      return (
                        <div
                          className="timeline-custom-icon-background-color"
                          style={{
                            backgroundColor:
                              item.color !== undefined
                                ? item.color
                                : defaultIcon
                                ? TIMELINE_DOTS.DEFAULT_ICON_COLOR
                                : TIMELINE_DOTS.DEFAULT_NOT_DEFINED,
                          }}
                        >
                          {defaultIcon ? (
                            <FontAwesomeIcon
                              icon={faCheck}
                              style={{ color: "#fff" }}
                            />
                          ) : (
                            item.icon
                          )}
                        </div>
                      );
                    }
                    if (item.color !== undefined) {
                      return (
                        <div
                          className="timeline-custom-dot-color"
                          style={{
                            backgroundColor:
                              item.icon === TIMELINE_DOTS.ACTIVE_DOT
                                ? TIMELINE_DOTS.ACTIVE_DOT_DEFAULT ||
                                  TIMELINE_DOTS.DOT_DEFAULT
                                : item.color || TIMELINE_DOTS.DOT_DEFAULT,
                          }}
                        ></div>
                      );
                    }
                    if (item.icon === TIMELINE_DOTS.ACTIVE_DOT) {
                      return (
                        <div
                          className="timeline-custom-dot-color"
                          style={{
                            backgroundColor:
                              TIMELINE_DOTS.ACTIVE_DOT_DEFAULT ||
                              TIMELINE_DOTS.DOT_DEFAULT,
                          }}
                        ></div>
                      );
                    }
                    if (
                      index === sortedData.length - 1 &&
                      (item.icon === TIMELINE_DOTS.DOT || !defaultIcon)
                    ) {
                      return (
                        <div
                          className="timeline-custom-dot-color"
                          style={{ backgroundColor: TIMELINE_DOTS.DOT_DEFAULT }}
                        ></div>
                      );
                    }
                    return undefined;
                  })()}
                >
                  <p className="timeline-item-header-text">{item.title}</p>
                  <p>{item.desc}</p>
                </RSTimeline.Item>
              ))}
          </RSTimeline>
        </Row>
      </div>
    </Col>
  );
}
