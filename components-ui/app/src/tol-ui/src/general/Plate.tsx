/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Well,
  TPlateData,
  IWellHoverContents
} from "..";

interface PPlate {
  id: string;
  rowLabels: string[];
  columnLabels: string[];
  data: TPlateData;
  onWellClick?: (id: string) => void;
  WellHoverContents?: (props: IWellHoverContents) => JSX.Element;
}

export function Plate(props: PPlate) {
  const { id, data, rowLabels, columnLabels, onWellClick, WellHoverContents } =
    props;

  return (
    <div id={id} className="tol-plate-container">
      <div className="tol-plate">
        <div className="tol-plate-col-label">
          {columnLabels.map((colLabel) => (
            <p className="tol-plate-col-header">{colLabel}</p>
          ))}
        </div>
        <div className="tol-plate-rows">
          <div className="tol-plate-row-label">
            {rowLabels.map((rowLabel) => (
              <p className="tol-plate-row-header">{rowLabel}</p>
            ))}
          </div>
          <div className="tol-plate-wells">
            {data.map((row) => (
              <div className="tol-plate-wells-row">
                {row.map((well) => (
                  <Well
                    data={well}
                    onClick={onWellClick}
                    HoverContents={WellHoverContents}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
