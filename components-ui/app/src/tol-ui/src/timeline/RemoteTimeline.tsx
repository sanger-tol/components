/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  DataPoint,
  TimelineItem,
  Timeline,
  Placeholder,
  httpClient,
  env
} from "..";


interface Props {
  endpoint: string;
  id: string;
  data: DataPoint;
  dateWithDay?: boolean;
  defaultIcon?: boolean;
  titleDataPoint: string;
}

export function RemoteTimeline(props: Props) {
  const {
    endpoint,
    id,
    data,
    dateWithDay,
    defaultIcon,
    titleDataPoint
  } = props;

  const [timelineData, setTimelineData] = useState<any>([]);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    createTimelineData(endpoint, id);
  }, [endpoint, id]);

  const parseValuesFromEndpoint = (
    endpointData: object,
    data: DataPoint,
  ): TimelineItem[] => {
    return Object.keys(data).reduce((acc: TimelineItem[], key) => {
      if (endpointData.hasOwnProperty(key)) {
        const timelineItem: TimelineItem = {
          title: data[key].title,
          date: endpointData[key],
          desc: data[key].desc || "",
          icon: data[key].icon || undefined,
          color: data[key].color || undefined,
        };
        acc.push(timelineItem);
      }
      return acc;
    }, []);
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

  const createTimelineId = (id: string, endpoint: string): string => {
    return `timeline-${endpoint}-${id}`;
  };

  const createTimelineData = async (endpoint: string, id: string) => {
    setLoading(true);

    try {
      const res: any = await httpClient().get(`/${endpoint}/${id}`, {
        baseURL: env.TOL_DATA,
      });

      if (res.status === 200) {
        const attributesData = res!.data.data.attributes;
        setName(attributesData[titleDataPoint] ?? titleDataPoint);

        const dataPointsObject = parseValuesFromEndpoint(attributesData, data);
        setTimelineData(dataPointsObject);
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div style={{ minHeight: "20px", marginTop: "20px" }}>
          <Placeholder clear loader />
        </div>
      ) : (
        <Timeline
          id={createTimelineId(id, endpoint)}
          title={createTitle(id, endpoint)}
          endless={false}
          data={timelineData}
          dateWithDay={dateWithDay}
          defaultIcon={defaultIcon}
        />
      )}
    </div>
  );
}
