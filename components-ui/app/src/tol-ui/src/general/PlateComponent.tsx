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
  const { id, data, rowLabels, columnLabels} = props;

  
  return (
    <div className="plate" id={id}>
      {data.map((row, rowIndex) => {
        return (
          <div key={rowIndex} className="row">
            {row.map((well, columnIndex)=> {
              return (
                <div key={columnIndex} className="well"><div className="rLabels">{rowIndex===0 && rowLabels[columnIndex]}</div><div className="cLabels">{columnIndex===0 && columnLabels[rowIndex]}</div>{well.label}</div>
                // <div key={columnIndex} className="well">{well.label}</div>
              )
            })}
          </div>
        )
      })}
    </div>
  );
}
