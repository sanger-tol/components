/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { CSSProperties } from "react";
import { Timeline as RSTimeline } from "rsuite";
import { ComponentBase, Icon } from "..";
import type { ITimeline } from "..";
import { getTimelineFields } from "./utils";

/** Renders selected date and boolean fields as a vertical timeline. */
export function Timeline(props: ITimeline) {
  const {
    fields, data = {}, endless = false, orderByDateFirst = true,
    hideUndefined = false, hideFuture = false, hidePast = false, ...rest
  } = props;
  const events = getTimelineFields({
    id: rest.id, fields, data, orderByDateFirst, hideUndefined, hideFuture, hidePast,
  });

  return (
    <ComponentBase {...rest}>
      <RSTimeline endless={endless} className="tol-timeline">
        {events.map(({ attribute, field, date, value }) => {
          const markerStyle = field.color
            ? { "--tol-timeline-color": field.color } as CSSProperties
            : undefined;
          const Marker = (
            <span
              className={`tol-timeline-marker${field.icon ? " tol-timeline-marker-icon" : ""}`}
              style={markerStyle}
              aria-hidden="true"
            >
              {field.icon && <Icon icon={field.icon} />}
            </span>
          );

          return (
            <RSTimeline.Item
              key={attribute}
              dot={Marker}
              time={date ? (
                <time dateTime={date.toISOString()}>{date.toLocaleDateString("en-GB")}</time>
              ) : undefined}
            >
              <strong>{field.rename ?? attribute}</strong>
              {!date && <p>{value === undefined ? "Not defined" : value ? "True" : "False"}</p>}
              {field.description && <p>{field.description}</p>}
            </RSTimeline.Item>
          );
        })}
      </RSTimeline>
    </ComponentBase>
  );
}
