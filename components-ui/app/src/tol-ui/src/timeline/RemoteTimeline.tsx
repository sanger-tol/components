/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import {
  createTitle,
  ITimelineData,
  IRemoteTarget,
  Placeholder,
  parseObjectValues,
  Timeline,
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

  const createTimelineData = async () => {
    setLoading(true);
    dataSource
      .getOne({ objectType, id })
      .then((dataObject: TDataObjectOrNull) => {
        setName(dataObject?.[titleDataPoint] ?? titleDataPoint);
        setTimelineData(parseObjectValues(dataObject, data));
      })
      .catch((error) => {
        console.warn(error);
      })
      .finally(() => {
        setLoading(false);
      });
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
