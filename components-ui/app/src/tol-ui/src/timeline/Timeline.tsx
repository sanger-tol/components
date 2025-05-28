/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState, useEffect } from "react";
import { Timeline as RSTimeline } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { Col, Row } from "..";


type iconType = "active-dot" | "dot";

export interface TimelineItem {
  title?: string;
  date?: Date;
  color?: string;
  icon?: iconType | React.ReactNode;
  desc?: string;
}

export interface DataPoint {
  [key: string]: TimelineItem;
}

interface Props {
  id: string;
  title: string;
  endless?: boolean;
  data: DataPoint;
  dateWithDay?: boolean;
  defaultIcon?: boolean;
}

const ACTIVE_DOT = "active-dot";
const DOT = "dot";
const DOT_DEFAULT = "#d9d9d9";
const ACTIVE_DOT_DEFAULT = "#039be5";
const DEFAULT_ICON_COLOR = "#15b215";
const DEFAULT_NOT_DEFINED = "#fff";

export function Timeline(props: Props) {
  const { id, title, endless, data, dateWithDay, defaultIcon } = props;
  const [sortedData, setSortedData] = useState<TimelineItem[]>([]);

  useEffect(() => {
    const parsedData: any = parseDataPoints(data);
    const sortedTimeline = sortTimelineByDate(parsedData);
    setSortedData(sortedTimeline);
  }, [data]);

  const parseDataPoints = (data: DataPoint): TimelineItem[] => {
    return Object.entries(data).reduce((acc: TimelineItem[], [key, value]) => {
      if (value === null || value === undefined) {
        return acc;
      }

      let parsedDate: Date | null = null;
      if (typeof value.date === "string") {
        const dateString = value.date as string;
        const date = new Date(
          dateString + (dateString.indexOf("Z") === -1 ? "Z" : ""),
        );
        if (!isNaN(date.getTime())) {
          parsedDate = date;
        }
      } else if (value.date instanceof Date) {
        parsedDate = value.date;
      }

      if (parsedDate !== null) {
        acc.push({
          title: value.title ?? key,
          date: parsedDate,
          color: value.color,
          icon: value.icon || (
            <FontAwesomeIcon icon={faCheck} style={{ color: "#fff" }} />
          ),
          desc: value.desc || "",
        });
      }
      return acc;
    }, []);
  };

  const sortTimelineByDate = (timeline: TimelineItem[]) => {
    return timeline.sort((a, b) => {
      const dateA = new Date(a.date!);
      const dateB = new Date(b.date!);
      return dateA.getTime() - dateB.getTime();
    });
  };

  return (
    <Col>
      <div style={{ display: "contents" }}>
        <Row style={{ marginBottom: "10px" }}>
          <p className="timeline-header-text">{title}</p>
        </Row>
        <Row>
          <RSTimeline endless={endless} className="timeline-wrapper" id={id}>
            {sortedData
              .filter((item: TimelineItem) => item.date !== null)
              .map((item: TimelineItem, index: Number) => (
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
                                  ? DEFAULT_ICON_COLOR
                                  : DEFAULT_NOT_DEFINED,
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
                              item.icon === ACTIVE_DOT
                                ? ACTIVE_DOT_DEFAULT || DOT_DEFAULT
                                : item.color || DOT_DEFAULT,
                          }}
                        ></div>
                      );
                    }
                    if (item.icon === ACTIVE_DOT) {
                      return (
                        <div
                          className="timeline-custom-dot-color"
                          style={{
                            backgroundColor: ACTIVE_DOT_DEFAULT || DOT_DEFAULT,
                          }}
                        ></div>
                      );
                    }
                    if (
                      index === sortedData.length - 1 &&
                      (item.icon === DOT || !defaultIcon)
                    ) {
                      return (
                        <div
                          className="timeline-custom-dot-color"
                          style={{ backgroundColor: DOT_DEFAULT }}
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
