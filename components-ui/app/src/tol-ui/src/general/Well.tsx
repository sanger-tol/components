/*
 * SPDX-FileCopyrightText: 2025 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Progress } from "rsuite";
import { HoverOverlay, IWellData, IWellHoverContents } from "..";

interface IWell {
  data: IWellData;
  onClick?: (id: string) => void;
  HoverContents?: (props: IWellHoverContents) => JSX.Element;
}

export function Well(props: IWell) {
  const { data, onClick, HoverContents } = props;

  const PercentageCircle = (width: number, cN?: string) => (
    <Progress.Circle
      percent={data.percentage}
      strokeWidth={width}
      trailWidth={width}
      showInfo={false}
      className={cN}
    />
  );

  const StyledWell = () => {
    if (!data.percentage && !data.className) {
      return <div className="tol-well-classname" />;
    }
    if (data.percentage && !data.className) {
      return PercentageCircle(24);
    }
    if (!data.percentage && data.className) {
      return <div className={`tol-well-classname ${data.className}`} />;
    }
    if (data.percentage && data.className) {
      return (
        <>
          {PercentageCircle(12, "well-progress-circle")}
          <div className={`tol-well-percentage-classname ${data.className}`} />
        </>
      );
    }
    return <></>;
  };

  return (
    <>
      <HoverOverlay
        contents={
          HoverContents && <HoverContents id={data.id} data={data.data} />
        }
        placement="right"
      >
        <div
          className="tol-well tol-progress-circle-style"
          onClick={onClick ? () => onClick(data.id) : undefined}
        >
          <StyledWell />
        </div>
      </HoverOverlay>
    </>
  );
}
