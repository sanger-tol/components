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
  className: string;
  sampleVol: string;
}

interface Props {
  id: string;
  rowLabels: string[];
  columnLabels: string[];
  data: TPlateData;
  //   onClick: (id: string) => {};
  //   onHover: (id: string) => {};
}

export function PlateComponent(props: Props) {
  const { id, data, rowLabels, columnLabels } = props;

  const style = {
    width: "50px",
    display: "inline-block",
    margin: "8px",
  };

  return (
    <div id={id} className="tol-plate-container">
      <div className="tol-plate">
        <div className="tol-col-label">
          {columnLabels.map((colLabel, _) => (
            <p className="tol-col-header">{colLabel}</p>
          ))}
        </div>
        <div className="tol-rows">
          <div className="tol-row-label">
            {rowLabels.map((rowLabel, _) => (
              <p className="tol-row-header">{rowLabel}</p>
            ))}
          </div>
          <div className="tol-plate-wells">
            {data.map((row, _) => (
              <div className="tol-plate-wells-row">
                {row.map((well, _) => (
                  <HoverOverlay contents={well.label} placement="left">
                    <div className="well" style={style}><Progress.Circle percent={well.sampleVol.split('%')[0]} ></Progress.Circle></div>
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
