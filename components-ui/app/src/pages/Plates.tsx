/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IWellHoverContents, Plate, TPlateData, Widgets } from "../tol-ui/src";

const EXAMPLE_PLATE_DATA: TPlateData = [
  [
    {
      id: "A1",
      label: "A1",
      data: { concentration: "100%", size: "lg" },
    },
    {
      id: "B1",
      label: "B1",
      percentage: 20,
      data: { concentration: "20%", size: "sm" },
    },
    {
      id: "C1",
      label: "C1",
      className: "plate-well-success-test",
      data: { concentration: "40%", size: "sm" },
    },
    {
      id: "D1",
      label: "D1",
      className: "plate-well-success-test",
      percentage: 50,
      data: { concentration: "50%", size: "md" },
    },
    {
      id: "E1",
      label: "E1",
      className: "plate-well-success-test",
      percentage: 70,
      data: { concentration: "70%", size: "md" },
    },
    {
      id: "F1",
      label: "F1",
      className: "plate-well-success-test",
      percentage: 90,
      data: { concentration: "90%", size: "md" },
    },
    {
      id: "G1",
      label: "G1",
      percentage: 80,
      data: { concentration: "80%", size: "md" },
    },
    {
      id: "H1",
      label: "H1",
      percentage: 30,
      data: { concentration: "30%", size: "sm" },
    },
  ],
];

const COL_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const ROW_NAMES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

export function Plates() {
  const activeIdDecoder = (id: string) => {
    alert(`You clicked: ${id}`);
  };

  const SingleWellHoverContents = (props: IWellHoverContents) => {
    const { id, data } = props;

    return (
      <div>
        <ul>
          <li>"id:"{id}</li>
          <li>"concentration:"{data.concentration}</li>
          <li>"size:"{data.size}</li>
        </ul>
      </div>
    );
  };

  const PlateComponent = (
    <Plate
      id="plate1"
      data={EXAMPLE_PLATE_DATA}
      rowLabels={ROW_NAMES}
      columnLabels={COL_NAMES}
      onWellClick={activeIdDecoder}
      WellHoverContents={SingleWellHoverContents}
    />
  );

  const components = [
    {
      component: PlateComponent,
      type: "full",
    },
  ];

  return (
    <div className="barcharts">
      <Widgets components={components} />
    </div>
  );
}
