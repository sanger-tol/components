/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  ITimelineData,
  ITimelineItem,
  Timeline,
  Placeholder,
  IRemoteTarget,
  TDataObjectOrNull,
} from "..";

interface IRemoteTimeline extends IRemoteTarget {
  id: string;
  data: ITimelineData;
  dateWithDay?: boolean;
  defaultIcon?: boolean;
  titleDataPoint: string;
}

export function RemoteTimeline(props: IRemoteTimeline) {
  const {
    id,
    objectType,
    dataSource,
    data,
    dateWithDay,
    defaultIcon,
    titleDataPoint,
  } = props;

  const [timelineData, setTimelineData] = useState<any>([]);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    createTimelineData();
  }, []);

  const parseObjectValues = (
    dataObject: TDataObjectOrNull
  ): ITimelineItem[] => {
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
  };

  const createTimelineData = async () => {
    setLoading(true);
    dataSource
      .getOne({ objectType, id })
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
  };

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
