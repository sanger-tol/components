/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { CSSProperties } from "react";
import { Timeline as RSTimeline } from "rsuite";
import { ComponentBase, Icon } from "..";
import type { IComponentData, IFieldTimeline } from "..";


/** Specific options for the `Timeline` component. */
export interface PTimelineOptions {
  /** Continue timeline after end node. */
  endless?: boolean;
}

/** Props for the Timeline component. */
export interface PTimeline extends PTimelineOptions, IComponentData {}

/** Renders selected date and boolean fields as a vertical timeline. */
export function Timeline(props: PTimeline) {
  const { fields, data = {}, endless = false, ...rest } = props;

  const TimelineMarker = (field: IFieldTimeline) => {
    const markerStyle = field.color
      ? { "--tol-timeline-color": field.color } as CSSProperties
      : undefined;

    return (
      <div
        className={`tol-timeline-marker${field.icon ? " tol-timeline-marker-icon" : ""}`}
        style={markerStyle}
      >
        {field.icon && <Icon icon={field.icon} />}
      </div>
    );
  };

  return (
    <ComponentBase
      {...rest}
      className="with-overflow"
    >
      <RSTimeline className="tol-timeline" endless={endless}>
        {fields?.order?.active?.map((id) => {
          const field = fields?.dataWithDefaults?.[id] as IFieldTimeline;

          return (
            <RSTimeline.Item
              key={id}
              dot={TimelineMarker(field)}
              time={data[id]}
            >
              <strong>{field.rename ?? id}</strong>
              {field.description && <div className="tol-timeline-description">{field.description}</div>}
            </RSTimeline.Item>
          );
        })}
      </RSTimeline>
    </ComponentBase>
  );
}
