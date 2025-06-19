/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

export type TPlateData = Array<TRow>;
type TRow = Array<IWell>;

interface IWell {
  id: string;
  label: string;
  className: string;
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

  return (
    <>
    <div className="plate" id={id}>
      {data.map((row, rowIndex) => {
        return (
          <div key={rowIndex} className="rows">
            <div className="rLabels">{rowLabels[rowIndex]}</div>
            {row.map((well, columnIndex) => {
              return (
                <div>
                    <div className="cLabels">{rowIndex === 0 && columnLabels[columnIndex]}</div>
                    <div key={columnIndex} className="well">
                    {well.label}
                    </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
    </>
  );
}
