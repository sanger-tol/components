/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PlateComponent, TPlateData } from "../tol-ui/src/general";

// const examplePlateData: IPlateData = [
//   [
//     { id: "A1", label: "A1", className: "well" },
//   ],
// ];

const examplePlateData: TPlateData = [
  [
    { id: "A1", label: "A1", className: "well" },
    { id: "B1", label: "B1", className: "well" },
    { id: "C1", label: "C1", className: "well" },
  ],
  [
    { id: "A2", label: "A2", className: "well" },
    { id: "B2", label: "B2", className: "well" },
    { id: "C2", label: "C2", className: "well" },
  ],
];
 
const rowNames = ['A', 'B', 'C', 'D', 'E', 'F'];
const colNames = ['1', '2'];

function Sandbox() {
  return (
    <>
      <PlateComponent data={examplePlateData} rowLabels={rowNames} columnLabels={colNames} />
    </>
  );
}

export default Sandbox;
