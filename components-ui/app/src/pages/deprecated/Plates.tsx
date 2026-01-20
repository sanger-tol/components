/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { IWellHoverContents, Plate, TPlateData, Widgets } from "../../tol-ui/src";

const EXAMPLE_PLATE_DATA: TPlateData = [
  [
    {
      id: "A1",
      label: "A1",
      data: { concentration: "100%", size: "lg" },
    },
    {
      id: "A2",
      label: "A2",
      percentage: 20,
      data: { concentration: "20%", size: "sm" },
    },
    {
      id: "A3",
      label: "A3",
      className: "plate-well-success-test",
      data: { concentration: "40%", size: "sm" },
    },
    {
      id: "A4",
      label: "A4",
      className: "plate-well-success-test",
      percentage: 50,
      data: { concentration: "50%", size: "md" },
    },
    {
      id: "A5",
      label: "A5",
      className: "plate-well-success-test",
      percentage: 70,
      data: { concentration: "70%", size: "md" },
    },
    {
      id: "A6",
      label: "A6",
      className: "plate-well-success-test",
      percentage: 90,
      data: { concentration: "90%", size: "md" },
    },
    {
      id: "A7",
      label: "A7",
      percentage: 80,
      data: { concentration: "80%", size: "md" },
    },
    {
      id: "A8",
      label: "A8",
      percentage: 30,
      data: { concentration: "30%", size: "sm" },
    },
    {
      id: "A9",
      label: "A9",
      percentage: 50,
      data: { concentration: "50%", size: "sm" },
    },
    {
      id: "A10",
      label: "A10",
      percentage: 60,
      data: { concentration: "60%", size: "sm" },
    },
    {
      id: "A11",
      label: "A11",
      percentage: 70,
      data: { concentration: "70%", size: "sm" },
    },
    {
      id: "A12",
      label: "A12",
      percentage: 80,
      data: { concentration: "80%", size: "sm" },
    },
  ],
  [
    {
      id: "B1",
      label: "B1",
      percentage: 50,
      data: { concentration: "50%", size: "md" },
    },
  ],
  [
    {
      id: "C1",
      label: "C1",
      percentage: 50,
      data: { concentration: "50%", size: "sm" },
    },
  ],
  [
    {
      id: "D1",
      label: "D1",
      percentage: 50,
      data: { concentration: "50%", size: "sm" },
    },
  ],
  [
    {
      id: "E1",
      label: "E1",
      percentage: 50,
      data: { concentration: "50%", size: "sm" },
    },
  ],
  [
    {
      id: "F1",
      label: "F1",
      percentage: 50,
      data: { concentration: "50%", size: "sm" },
    },
  ],
  [
    {
      id: "G1",
      label: "G1",
      percentage: 50,
      data: { concentration: "50%", size: "sm" },
    },
  ],
  [
    {
      id: "H1",
      label: "H1",
      percentage: 50,
      className: "plate-well-success-test",
      data: { concentration: "50%", size: "sm" },
    },
  ],
];

const ROW_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const COL_NAMES = [
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

  const Title = <h2>Plate</h2>;

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
      component: Title,
      type: "title",
    },
    {
      component: PlateComponent,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}
