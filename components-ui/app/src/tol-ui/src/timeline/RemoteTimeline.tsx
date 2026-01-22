/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  TimeLineData,
  TimelineItem,
  Timeline,
  Placeholder,
  IRemoteTarget,
  TDataObjectOrNull
} from "..";


/**
 * @autodoc
 * 
 * RemoteTimeline visualises a timeline of events sourced from a remote `dataSource`.
 * It creates a chronological representation of events, complete with titles, descriptions, and customisable icons.
 * 
 * @remarks
 * This component handles various types of objects, automatically generating titles based on 
 * the object type and its ID, making it flexible for different contexts.
 */

interface PRemoteTimeline extends IRemoteTarget {
  /**
   * Unique identifier for the timeline instance, used in generating element IDs and for API interactions
   */
  id: string;
  /**
   * The data structure required to generate timeline items, containing titles, descriptions, and optional icons and colors for each event
   */
  data: TimeLineData;
  /**
   * Optional boolean indicating whether dates should be displayed with the respective weekday
   */
  dateWithDay?: boolean;
  /**
   * Optional boolean to control whether a default icon should be displayed for timeline items that do not specify one
   */
  defaultIcon?: boolean;
  /**
   * The key used to fetch the title for the timeline from the data object, providing context for the displayed events
   */
  titleDataPoint: string;
}

export function RemoteTimeline(props: PRemoteTimeline) {
  const {
    id,
    objectType,
    dataSource,
    data,
    dateWithDay,
    defaultIcon,
    titleDataPoint
  } = props;

  const [timelineData, setTimelineData] = useState<any>([]);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    createTimelineData();
  }, []);

  const parseObjectValues = (
    dataObject: TDataObjectOrNull,
  ): TimelineItem[] => {
    return Object.keys(data).reduce((acc: TimelineItem[], key) => {
      if (dataObject && dataObject[key]) {
        const timelineItem: TimelineItem = {
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
  };

  const createTimelineData = async () => {
    setLoading(true);
    dataSource
      .getOne({objectType, id})
      .then((dataObject: TDataObjectOrNull) => {
        setName(dataObject?.[titleDataPoint] ?? titleDataPoint);
        setTimelineData(parseObjectValues(dataObject));
      })
      .catch((error) => {
        console.warn(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const createTitle = (id: string, endpoint: string): string => {
    switch (endpoint) {
      case "species":
        return `Timeline of completed events for ${name}`;
      case "sample":
        return `Timeline of completed events for ${endpoint} - ${id}`;
      default:
        return "Timeline of events";
    }
  };

  if (loading) {
    return <Placeholder clear loader />;
  }

  return (
    <Timeline
      id={`timeline-${objectType}-${id}`}
      title={createTitle(id, objectType)}
      endless={false}
      data={timelineData}
      dateWithDay={dateWithDay}
      defaultIcon={defaultIcon}
    />
  );
}
