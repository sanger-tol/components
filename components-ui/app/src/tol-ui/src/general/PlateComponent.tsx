/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import HoverOverlay from "./HoverOverlay";
import { Progress } from "rsuite";

export type TPlateData = Array<TRow>;
type TRow = Array<IWell>;

interface IWell {
  id: string;
  label: string;
  className?: string;
  percentage?: number;
  data?: any;
}

export interface IWellHoverContents {
  id: string;
  data: any;
}

interface Props {
  id: string;
  rowLabels: string[];
  columnLabels: string[];
  data: TPlateData;
  onWellClick?: (id: string) => void;
  WellHoverContents?: (props: IWellHoverContents) => JSX.Element;
}

export function PlateComponent(props: Props) {
  const {
    id,
    data,
    rowLabels,
    columnLabels,
    onWellClick,
    WellHoverContents
  } = props;

  const style = {
    width: "50px",
    display: "inline-block",
    margin: "8px",
  };

  return (
    <div id={id} className="tol-plate-container">
      <div className="tol-plate">
        <div className="tol-plate-col-label">
          {columnLabels.map((colLabel, _) => (
            <p className="tol-plate-col-header">{colLabel}</p>
          ))}
        </div>
        <div className="tol-plate-rows">
          <div className="tol-plate-row-label">
            {rowLabels.map((rowLabel, _) => (
              <p className="tol-plate-row-header">{rowLabel}</p>
            ))}
          </div>
          <div className="tol-plate-wells">
            {data.map((row, _) => (
              <div className="tol-plate-wells-row">
                {row.map((well, _) => (
                  <HoverOverlay
                    contents={
                      WellHoverContents &&
                        <WellHoverContents
                          id={well.id}
                          data={well.data}
                        />
                    }
                    placement="right"
                  >
                    <div
                      className="well"
                      style={style}
                      onClick={
                        onWellClick ? 
                          () => onWellClick(well.id)
                        :
                          undefined
                      }
                    >
                      <Progress.Circle
                        percent={well.volume}
                        strokeWidth={well.className ? 12 : 20}
                        trailWidth={well.className ? 12 : 20}
                        showInfo={false}
                      />
                    </div>
                  </HoverOverlay>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
