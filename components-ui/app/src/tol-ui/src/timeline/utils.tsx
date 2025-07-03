/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/
import { ITimelineData, ITimelineItem, TDataObjectOrNull } from "..";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

export function createTitle(id: string, endpoint: string): string {
  switch (endpoint) {
    case "species":
      return `Timeline of completed events for ${name}`;
    case "sample":
      return `Timeline of completed events for ${endpoint} - ${id}`;
    default:
      return "Timeline of events";
  }
}

export function parseDataPoints(data: ITimelineData): ITimelineItem[] {
  return Object.entries(data).reduce((acc: ITimelineItem[], [key, value]) => {
    if (value === null || value === undefined) {
      return acc;
    }

    let parsedDate: Date | null = null;
    if (typeof value.date === "string") {
      const dateString = value.date as string;
      const date = new Date(
        dateString + (dateString.indexOf("Z") === -1 ? "Z" : "")
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
}

export function parseObjectValues(
  dataObject: TDataObjectOrNull,
  data
): ITimelineItem[] {
  return Object.keys(data).reduce((acc: ITimelineItem[], key) => {
    if (dataObject && dataObject[key]) {
      const timelineItem: ITimelineItem = {
        title: data[key].title,
        date: dataObject[key],
        desc: data[key].desc || "",
        icon: data[key].icon || undefined,
        color: data[key].color || undefined,
      };
      acc.push(timelineItem);
    }
    return acc;
  }, []);
}

export function sortTimelineByDate(timeline: ITimelineItem[]) {
  return timeline.sort((a, b) => {
    const dateA = new Date(a.date!);
    const dateB = new Date(b.date!);
    return dateA.getTime() - dateB.getTime();
  });
}
